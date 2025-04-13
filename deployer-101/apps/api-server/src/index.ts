import express from "express";
import { Server } from "socket.io";

import dotenv from "dotenv";
import { projectRouter } from "./routes/project.routes";
import { userRouter } from "./routes/user.routes";
import { clickhouseClient, kafkaClient } from "./config/config";
import { v4 } from "uuid";
dotenv.config();

// Socket.io server setup
// const io = new Server({ cors: { origin: "*" } });
// io.on("connection", (socket) => {
//   console.log("Socket.io client connected:", socket.id);

//   socket.on("subscribe", (projectId) => {
//     console.log("Subscribing to project:", projectId);
//     socket.join(projectId);
//     socket.emit("message", `Subscribed to project ${projectId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Socket.io client disconnected:", socket.id);
//   });
// });

// io.listen(7000);
// console.log("Socket.io server is running on port 7000");

const consumer = kafkaClient.consumer({ groupId: "api-server-logs-consumer" });

const initKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs" });
  await consumer.run({
    autoCommit: false,
    eachBatch: async ({
      batch,
      commitOffsetsIfNecessary,
      heartbeat,
      resolveOffset,
    }) => {
      const messages = batch.messages;
      console.log("Received messages:", messages.length);
      for (const message of messages) {
        const parsedMessage = JSON.parse(message.value?.toString() || "{}");
        console.log("Parsed message:", parsedMessage);
        try {
          const { query_id } = await clickhouseClient.insert({
            table: "log_events",
            values: [
              {
                event_id: v4(),
                deployment_id: parsedMessage.deploymentId,
                // project_id: parsedMessage.projectId,
                log: parsedMessage.log,
              },
            ],
            format: "JSONEachRow",
          });

          console.log("Inserted log event with query ID:", query_id);
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
        } catch (error) {
          console.error("Error inserting log event:", error);
          // Handle the error, e.g., retry or log it
        }
      }
    },
  });
};

initKafkaConsumer().catch((error) => {
  console.error("Error initializing Kafka consumer:", error);
});

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
