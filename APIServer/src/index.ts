import express, { Request, Response } from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const LOCAL_ENVS = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "ECS_CLUSTER",
  "ECS_TASK_ARN",
];

LOCAL_ENVS.forEach((env) => {
  if (!process.env[env]) {
    console.log("Missing ENV:", env);
    throw new Error(`Environment variable ${env} not found`);
  }
});

const app = express();

app.get("/project", async (req: Request, res: Response) => {
  try {
    const { githubRepo = `https://github.com/hanuchaudhary/todoReact` } =
      req.body;
    const projectNameSlug = generateSlug(2);
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
            ],
          },
        ],
      },
    });

    console.log("Running Task Container...");
    await ecsClient.send(command);
    console.log("Container runs successfully");

    res.status(200).json({ slug: projectNameSlug });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
