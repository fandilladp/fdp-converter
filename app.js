const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = 1212;
const secretKey = 'YOUR_SECRET_KEY_HERE';
const hashedSecret = crypto.createHash('sha256').update(secretKey).digest();  // Hash the secretKey
const algorithm = 'aes-256-cbc';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, hashedSecret, iv);  // Use hashedSecret
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, hashedSecret, iv);  // Use hashedSecret
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

app.get('/uploadform', (req, res) => {
    const formHTML = `
        <form ref='uploadForm' 
            id='uploadForm' 
            action='/upload' 
            method='post' 
            encType="multipart/form-data">
            <input type="file" name="file" />
            <input type='submit' value='Upload & Encrypt' />
        </form>
    `;
    res.send(formHTML);
});

app.post('/upload', upload.single('file'), (req, res) => {
    const jsonString = req.file.buffer.toString('utf8');
    const encryptedData = encrypt(jsonString);
    fs.writeFileSync('output.fdp', encryptedData);
    res.send('File has been encrypted and saved as output.fdp');
});

app.get('/decrypt', (req, res) => {
    const encryptedData = fs.readFileSync('output.fdp', 'utf8');
    const decryptedData = decrypt(encryptedData);
    res.json(JSON.parse(decryptedData));
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
