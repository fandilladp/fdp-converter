import { FDPConverter, createServer } from "../src/index"; // Adjust the path if needed

const testServerConfig = {
  secretKey: "YOUR_TEST_SECRET_KEY",
  port: 3333, // Use a different port for testing if needed
  algorithm: "aes-256-cbc",
  outputFileName: "test_output.fdp",
  outputPath: "./test_db",
};

describe("FDPConverter", () => {
  let fdpConverter: FDPConverter;
  let server;

  beforeAll(() => {
    server = createServer(testServerConfig);
    fdpConverter = new FDPConverter("YOUR_DEFAULT_SECRET");
  });

  afterAll(() => {
    server.close();
  });

  test("should encrypt and decrypt correctly", () => {
    const plaintext = "Hello, world!";
    const encrypted = fdpConverter.encrypt(plaintext);
    const decrypted = fdpConverter.decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });
});
