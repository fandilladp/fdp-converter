# FDP Converter

FDP Converter is a tool that enables you to convert JSON files into your desired file format equipped with encryption. It adds an extra layer of security to your data when sharing or storing it.

<img src="./assets/logo.png" alt="FDP Converter Logo" width="200"/>

## 🌟 Features

- **Quick Conversion**: Transform your JSON files into FDP format in just a few seconds.
- **High Security**: Your JSON file will be encrypted before conversion.
- **Customization**: You can tailor the output file name as per your requirements.

## 📋 Prerequisites

Before using FDP Converter, ensure you have:

- A `.json` format file.
- Node.js and NPM installed on your system.

## 🚀 How to Use

1. Clone this repository or download the source code.
2. Run `npm install` to install all required dependencies.
3. Start the server by running `node app.js`.
4. Open your browser and navigate to `http://localhost:1212/uploadform` to access the upload form.
5. Upload your JSON file and wait until the conversion is complete.
6. The FDP file will be saved with the default name `output.fdp`, but you can customize it according to your needs in the code.

## 🛠️ Customizing File Name

If you wish to customize the output file name:

- Open `app.js`.
- Locate the line `fs.writeFileSync('output.fdp', encryptedData);`.
- Replace `'output.fdp'` with your desired file name.

## 📄 License

Distributed under the MIT license. See `LICENSE` for more information.

---

Please adjust the content as per your needs and preferences, especially parts like the logo location or license information if they differ. Also, ensure to provide any additional information that you deem essential for other developers.