const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mimeTypes = require("mime-types");
const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});
redisClient.on("connect", () => {
  console.log("Connected to Redis server.");
})

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

const publishLog = (log) => {
  redisClient.publish(
    `logs:${process.env.PROJECT_ID}`,
    JSON.stringify({
      log: log,
      timestamp: new Date().toISOString(),
    })
  );
};

const init = () => {
  console.log("Starting build process...");
  publishLog("Starting build process...");
  const outputDir = path.join(__dirname, "output");

  console.log("Executing npm install & build...");
  publishLog("Executing npm install & build...");
  const p = exec(`cd ${outputDir} && npm install && npm run build`);

  p.stdout.on("data", (data) => {
    console.log("Build:", data.toString());
    publishLog(`Build: ${data.toString()}`);
  });

  p.stdout.on("error", (data) => {
    console.error("error", data.toString());
    publishLog(`Error: ${data.toString()}`);
  });

  p.stdout.on("close", async (code) => {
    console.log(`Build process exited with code ${code}`);
    publishLog(`Build process exited with code ${code}`);
    const distFolderPath = path.join(outputDir, "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    console.log("Uploading files to S3...");
    publishLog("Uploading files to S3...");

    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      // Skip if the file is a directory
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log(`Uploading ${filePath} to S3...`);
      publishLog(`Uploading ${filePath} to S3...`);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimeTypes.lookup(filePath) || "application/octet-stream",
      });

      await s3Client.send(command);
      console.log(`Uploaded ${filePath} to S3`);
      publishLog(`Uploaded ${filePath} to S3`);
    }
    console.log("Build process completed successfully.");
    console.log("All files uploaded to S3.");
    publishLog("Build process completed successfully.");
    publishLog("All files uploaded to S3.");
  });
};

init();
