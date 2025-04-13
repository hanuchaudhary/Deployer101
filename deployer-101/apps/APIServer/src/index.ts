import express from "express";
import { Server } from "socket.io";

import dotenv from "dotenv";
import { projectRouter } from "./routes/project.routes";
import { userRouter } from "./routes/user.routes";
import { kafka } from "./config/config";
dotenv.config();

// Socket.io server setup
const io = new Server({ cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Socket.io client connected:", socket.id);

  socket.on("subscribe", (projectId) => {
    console.log("Subscribing to project:", projectId);
    socket.join(projectId);
    socket.emit("message", `Subscribed to project ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket.io client disconnected:", socket.id);
  });
});

io.listen(7000);
console.log("Socket.io server is running on port 7000");

const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

const initKafkaConsumer = async () => {
  await consumer.subscribe({ topic: "logs" });
};

// This is a list of environment variables that are required for the application to run locally.
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
