import express, { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
export class FDPConverter {
  private secretKey: string;
  private algorithm: string;
  private hashedSecret: Buffer;

  constructor(secretKey: string, algorithm = "aes-256-cbc") {
    this.secretKey = secretKey;
    this.algorithm = algorithm;
    this.hashedSecret = crypto
      .createHash("sha256")
      .update(this.secretKey)
      .digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.hashedSecret, iv); // Use hashedSecret
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  decrypt(text: string): string {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.hashedSecret,
      iv
    ); // Use hashedSecret
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export const createServer = (
  config: {
    secretKey: string;
    port?: number;
    algorithm?: string;
    outputFileName?: string;
    outputPath?: string;
  },
  suppressLog = false
) => {
  const {
    secretKey,
    port = 1212,
    algorithm = "aes-256-cbc",
    outputFileName = "output.fdp",
    outputPath = __dirname,
  } = config;

  const app = express();
  const fdpConverter = new FDPConverter(secretKey, algorithm);
  const fullOutputPath = path.join(outputPath, outputFileName);

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  app.get("/uploadform", (req: Request, res: Response) => {
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

  app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
    const jsonString = req.file?.buffer.toString("utf8")!;
    const encryptedData = fdpConverter.encrypt(jsonString);
    fs.writeFileSync(fullOutputPath, encryptedData);
    res.download(fullOutputPath);
  });

  app.get("/decrypt", (req: Request, res: Response) => {
    const encryptedData = fs.readFileSync(outputFileName, "utf8");
    const decryptedData = fdpConverter.decrypt(encryptedData);
    res.json(JSON.parse(decryptedData));
  });
  app.get("/decryptform", (req: Request, res: Response) => {
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

  app.post(
    "/decryptfile",
    upload.single("encryptedFile"),
    (req: Request, res: Response) => {
      const encryptedString = req.file?.buffer.toString("utf8")!;
      const decryptedData = fdpConverter.decrypt(encryptedString);

      // Set the response header to prompt the user to download the file
      res.setHeader(
        "Content-disposition",
        "attachment; filename=decrypted.json"
      );
      res.setHeader("Content-type", "application/json");

      res.send(decryptedData);
    }
  );

  return app.listen(port, () => {
    if (!suppressLog) {
      console.log(`App listening at http://localhost:${port}`);
    }
  });
};

if (require.main === module) {
  const serverConfig = {
    secretKey: process.env.SECRET_KEY || "YOUR_DEFAULT_SECRET",
    port: 1212,
    algorithm: "aes-256-cbc",
    outputFileName: "output.fdp",
    outputPath: "./db",
  };
  const server = createServer(serverConfig);
}
