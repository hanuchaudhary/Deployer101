import express, { Request, Response } from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import Redis from "ioredis";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || "");
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

const subscriber = new Redis(process.env.REDIS_URL || "");

const initRedisSubscriber = async () => {
  console.log("Initializing Redis subscriber...");
  await subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    io.to(channel).emit("message", message);
  });
};

initRedisSubscriber()

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

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const app = express();
app.use(express.json());

app.post("/project", async (req: Request, res: Response) => {
  try {
    const { githubRepo, slug } = req.body;
    const projectNameSlug = slug ? slug : generateSlug(2);
    console.log(`Generated Slug: ${projectNameSlug}`);

    const command = new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER || "",
      taskDefinition: process.env.ECS_TASK_ARN,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            "subnet-0fbc30ffc49ff3a46",
            "subnet-0d4c176843822ba67",
            "subnet-037165a880b9f2be4",
          ],
          assignPublicIp: "ENABLED",
          securityGroups: ["sg-032c64c6d79c083d6"],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "deployer-builder-image",
            environment: [
              { name: "GIT_REPOSITORY_URL", value: githubRepo },
              { name: "PROJECT_ID", value: projectNameSlug },
              { name: "AWS_REGION", value: process.env.AWS_REGION },
              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID,
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY,
              },
              {
                name: "REDIS_URL",
                value: process.env.REDIS_URL,
              },
              {
                name: "AWS_BUCKET_NAME",
                value: process.env.AWS_BUCKET_NAME,
              },
            ],
          },
        ],
      },
    });

    console.log("Running Task Container...");
    await ecsClient.send(command);
    console.log("Container runs successfully");

    res.status(200).json({
      slug: projectNameSlug,
      url: `http://${projectNameSlug}.localhost:8000`,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
