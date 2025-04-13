const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mimeTypes = require("mime-types");
const { Kafka } = require("kafkajs");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
if (!PROJECT_ID) {
  console.error("PROJECT_ID is not set. Exiting...");
  process.exit(1);
}
const kafka = new Kafka({
  clientId: `build-server-${DEPLOYMENT_ID}`,
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    mechanism: "plain",
  },
});

const producer = kafka.producer();

const publishLog = async (log) => {
  await producer.send({
    topic: "logs",
    messages: [{ value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log }) }],
  });
  console.log(log);
};

const init = async () => {
  await publishLog("Starting build process...");
  const outputDir = path.join(__dirname, "output");

  await publishLog("Executing npm install & build...");
  const p = exec(`cd ${outputDir} && npm install && npm run build`);

  p.stdout.on("data", async (data) => {
    await publishLog(`Build: ${data.toString()}`);
  });

  p.stdout.on("error", async (data) => {
    await publishLog(`Error: ${data.toString()}`);
  });

  p.stdout.on("close", async (code) => {
    await publishLog(`Build process exited with code ${code}`);
    const distFolderPath = path.join(outputDir, "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    await publishLog("Uploading files to S3...");

    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      // Skip if the file is a directory
      if (fs.lstatSync(filePath).isDirectory()) continue;

      await publishLog(`Uploading ${filePath} to S3...`);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimeTypes.lookup(filePath) || "application/octet-stream",
      });

      await s3Client.send(command);
      await publishLog(`Uploaded ${filePath} to S3`);
    }
    await publishLog("Build process completed successfully.");
    await publishLog("All files uploaded to S3.");

    redisClient.quit();
    process.exit(0);
  });
};

init();
