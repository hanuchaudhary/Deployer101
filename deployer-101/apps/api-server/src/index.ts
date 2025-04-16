import express from "express";
import dotenv from "dotenv";
import { projectRouter } from "./routes/project.routes";
import { userRouter } from "./routes/user.routes";
import { startConsumers } from "./config/kafka";
import cors from "cors";
import { webhookRouter } from "./routes/webhook.route";
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

startConsumers()

// Express server setup
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/webhook", webhookRouter);

// Listening on the specified port
app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
