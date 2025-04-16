const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mimeTypes = require("mime-types");
const { Kafka, Partitioners } = require("kafkajs");

const {
  PROJECT_ID,
  DEPLOYMENT_ID,
  KAFKA_BROKER,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;

// Validate environment variables
const requiredEnvVars = {
  PROJECT_ID,
  DEPLOYMENT_ID,
  KAFKA_BROKER,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
};
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION,
});

// Initialize Kafka
const certsPath = path.join(__dirname, "./certs");
const kafka = new Kafka({
  enforceRequestTimeout: false,
  clientId: "api-server",
  brokers: [KAFKA_BROKER],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(certsPath, "ca.pem"), "utf-8")],
    cert: fs.readFileSync(path.join(certsPath, "service.cert"), "utf-8"),
    key: fs.readFileSync(path.join(certsPath, "service.key"), "utf-8"),
  },
});

const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

// Connect Kafka producer once
const initProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka producer connected successfully");
  } catch (err) {
    console.error("Failed to connect Kafka producer:", err);
    process.exit(1);
  }
};

// Deployement status Kafka topic
const publishDeploymentStatus = async (status, error = null) => {
  try {
    await producer.send({
      topic: "deployment-status",
      messages: [
        {
          value: JSON.stringify({
            PROJECT_ID,
            DEPLOYMENT_ID,
            status,
            ...(error ? { error } : {}), //if error is not null, include it in the message
          }),
        },
      ],
    });
    console.log("Deployment status published:", status);
  } catch (error) {
    console.error("Failed to publish deployment status:", error);
  }
};

// Disconnect Kafka producer
const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  } catch (err) {
    console.error('Failed to disconnect Kafka producer:', err);
  }
};

// Publish log to Kafka
const publishLog = async (log) => {
  try {
    await producer.send({
      topic: "logs",
      messages: [{ value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log }) }],
    });
    console.log("Log published:", log);
  } catch (err) {
    console.error("Failed to publish log:", err);
  }
};

const init = async () => {
  await initProducer(); // Connect producer once
  await publishLog("Starting build process...");

  const outputDir = path.join(__dirname, "output");

  // Run npm install and build
  await publishLog("Executing npm install & build...");
  const p = exec(`cd ${outputDir} && npm install && npm run build`);

  // Log stdout
  p.stdout.on("data", async (data) => {
    await publishLog(`Build: ${data.toString()}`);
  });

  // Log stderr
  p.stderr.on("data", async (data) => {
    await publishLog(`Build error: ${data.toString()}`);
  });

  // Handle process errors (e.g., command not found)
  p.on("error", async (err) => {
    await publishLog(`Process error: ${err.message}`);
    await publishDeploymentStatus("FAILED", err.message);
    await disconnectProducer(); // Disconnect producer on error
    process.exit(1);
  });

  // Handle process exit
  p.on("close", async (code) => {
    if (code !== 0) {
      await publishLog(`Build process failed with exit code ${code}`);
      await publishDeploymentStatus("FAILED", `Build process failed with exit code ${code}`);
      await disconnectProducer(); // Disconnect producer on error
      process.exit(1);
    }

    await publishLog(`Build process completed with code ${code}`);

    const distFolderPath = path.join(outputDir, "dist");
    if (!fs.existsSync(distFolderPath)) {
      await publishLog("Error: dist folder not found");
      await publishDeploymentStatus("FAILED", "dist folder not found");
      await disconnectProducer();
      process.exit(1);
    }

    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    await publishLog("Uploading files to S3...");

    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      await publishLog(`Uploading ${file} to S3...`);
      try {
        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET_NAME,
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mimeTypes.lookup(filePath) || "application/octet-stream",
        });

        await s3Client.send(command);
        await publishLog(`Uploaded ${file} to S3`);
      } catch (err) {
        await publishLog(`Failed to upload ${file} to S3: ${err.message}`);
        await publishDeploymentStatus("FAILED", `Failed to upload ${file} to S3: ${err.message}`);
        await disconnectProducer();
        process.exit(1);
      }
    }

    await publishLog('Build process completed successfully.');
    await publishLog('All files uploaded to S3.');
    await publishDeploymentStatus('SUCCEEDED'); // Publish SUCCEEDED status
    await disconnectProducer();
    process.exit(0); // Exit cleanly
  });
};

// Start the process
init().catch(async (err) => {
  await publishLog(`Initialization error: ${err.message}`);
  await publishDeploymentStatus('FAILED', `Initialization error: ${err.message}`);
  await disconnectProducer();
  process.exit(1);
});
