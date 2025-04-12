const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mimeTypes = require("mime-types");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const PROJECT_ID = process.env.PROJECT_ID || "default-project-id";
if (!PROJECT_ID) {
  console.error("PROJECT_ID is not set. Exiting...");
  process.exit(1);
}

const init = () => {
  console.log("Initializing build server...");
  const outputDir = path.join(__dirname, "output");

  const p = exec(`cd ${outputDir} && npm install && npm run build`);
  p.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  p.stdout.on("error", (data) => {
    console.error("error", data.toString());
  });

  p.stdout.on("close", async (code) => {
    console.log(`Build process exited with code ${code}`);
    const distFolderPath = path.join(outputDir, "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });
    console.log("dist folder contents", distFolderContents);

    for (const filePath of distFolderContents) {
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log(`Uploading ${filePath} to S3...`);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `__outputs/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimeTypes.lookup(filePath) || "application/octet-stream",
      });

      await s3Client.send(command);
      console.log(`Uploaded ${filePath} to S3`);
    }
    console.log("Build process completed successfully.");
    console.log("All files uploaded to S3.");
  });
};
