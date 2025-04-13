import express from "express";
import dotenv from "dotenv";
import { projectRouter } from "./routes/project.routes";
import { userRouter } from "./routes/user.routes";
import { clickhouseClient, kafkaClient } from "./config/config";
import { v4 as uuidv4 } from "uuid";
import { initKafkaConsumer } from "./config/kafka";
dotenv.config();

const LOCAL_ENVS = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "ECS_CLUSTER",
  "ECS_TASK_ARN",
  "REDIS_URL",
  "AWS_BUCKET_NAME",
];
LOCAL_ENVS.forEach((env) => {
  if (!process.env[env]) {
    console.log("Missing ENV:", env);
    throw new Error(`Environment variable ${env} not found`);
  }
});

initKafkaConsumer().catch((error) => {
  console.error("Error initializing Kafka consumer:", error);
});

// Express server setup
const app = express();
app.use(express.json());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRouter);

// Listening on the specified port
app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
