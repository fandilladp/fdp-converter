const express = require('express');
const multer = require('multer');
const { FDPConverter } = require('fdp-converter');
const path = require('path');
const fs = require('fs');

const app = express();
const fdpConverter = new FDPConverter('YOUR_SECRET_KEY');

const storage = multer.memoryStorage(); // Menyimpan file dalam memori
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

// Halaman utama dengan form unggah
app.get('/', (req, res) => {
    res.send(`
        <form ref='uploadForm' 
            action='/convert' 
            method='post' 
            encType="multipart/form-data">
            <input type='file' name='jsonFile' />
            <input type='submit' value='Convert to FDP' />
        </form>
        <br/><br/>
        <!-- Form baru untuk mengunggah FDP dan mengonversinya kembali ke JSON -->
        <form ref='decryptForm' 
            action='/decrypt' 
            method='post' 
            encType="multipart/form-data">
            <input type='file' name='fdpFile' />
            <input type='submit' value='Convert FDP to JSON' />
        </form>
    `);
});

// Proses unggah dan konversi
app.post('/convert', upload.single('jsonFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const jsonString = req.file.buffer.toString();
    const fdpData = fdpConverter.encrypt(jsonString);
    
    // Kirim file FDP sebagai respons untuk diunduh
    res.setHeader('Content-Disposition', 'attachment; filename=output.fdp');
    res.send(fdpData);
});

// Proses unggah FDP dan dekripsi kembali ke JSON
app.post('/decrypt', upload.single('fdpFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fdpString = req.file.buffer.toString();
    const jsonData = fdpConverter.decrypt(fdpString);

    // Kirim file JSON sebagai respons untuk diunduh
    res.setHeader('Content-Disposition', 'attachment; filename=output.json');
    res.send(jsonData);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
