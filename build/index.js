"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.FDPConverter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FDPConverter {
    constructor(secretKey, algorithm = "aes-256-cbc") {
        this.secretKey = secretKey;
        this.algorithm = algorithm;
        this.hashedSecret = crypto_1.default
            .createHash("sha256")
            .update(this.secretKey)
            .digest();
    }
    encrypt(text) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.hashedSecret, iv); // Use hashedSecret
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    }
    decrypt(text) {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift(), "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.hashedSecret, iv); // Use hashedSecret
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
exports.FDPConverter = FDPConverter;
const createServer = (config, suppressLog = false) => {
    const { secretKey, port = 1212, algorithm = "aes-256-cbc", outputFileName = "output.fdp", outputPath = __dirname, } = config;
    const app = (0, express_1.default)();
    const fdpConverter = new FDPConverter(secretKey, algorithm);
    const fullOutputPath = path_1.default.join(outputPath, outputFileName);
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({ storage: storage });
    app.get("/uploadform", (req, res) => {
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
    app.post("/upload", upload.single("file"), (req, res) => {
        var _a;
        const jsonString = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer.toString("utf8");
        const encryptedData = fdpConverter.encrypt(jsonString);
        fs_1.default.writeFileSync(fullOutputPath, encryptedData);
        res.download(fullOutputPath);
    });
    app.get("/decrypt", (req, res) => {
        const encryptedData = fs_1.default.readFileSync(outputFileName, "utf8");
        const decryptedData = fdpConverter.decrypt(encryptedData);
        res.json(JSON.parse(decryptedData));
    });
    app.get("/decryptform", (req, res) => {
        const formHTML = `
        <form ref='decryptForm' 
            id='decryptForm' 
            action='/decryptfile' 
            method='post' 
            encType="multipart/form-data">
            <input type="file" name="encryptedFile" />
            <input type='submit' value='Decrypt File' />
        </form>
    `;
        res.send(formHTML);
    });
    app.post("/decryptfile", upload.single("encryptedFile"), (req, res) => {
        var _a;
        const encryptedString = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer.toString("utf8");
        const decryptedData = fdpConverter.decrypt(encryptedString);
        // Set the response header to prompt the user to download the file
        res.setHeader("Content-disposition", "attachment; filename=decrypted.json");
        res.setHeader("Content-type", "application/json");
        res.send(decryptedData);
    });
    return app.listen(port, () => {
        if (!suppressLog) {
            console.log(`App listening at http://localhost:${port}`);
        }
    });
};
exports.createServer = createServer;
if (require.main === module) {
    const serverConfig = {
        secretKey: process.env.SECRET_KEY || "YOUR_DEFAULT_SECRET",
        port: 1212,
        algorithm: "aes-256-cbc",
        outputFileName: "output.fdp",
        outputPath: "./db",
    };
    const server = (0, exports.createServer)(serverConfig);
}
