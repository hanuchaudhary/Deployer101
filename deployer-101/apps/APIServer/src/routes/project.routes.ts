import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { Request, Response, Router } from "express";
import { generateSlug } from "random-word-slugs";
import { ecsClient } from "../config/config";
import { projectSchema } from "@repo/common/validations";
import { prisma } from "@repo/database/client";

export const projectRouter: Router = Router();

// POST-ROUTE: domain | for checking if the subdomain is available
projectRouter.post("/domain", async (req: Request, res: Response) => {
  try {
    const { subDomain } = req.body;
    if (!subDomain) {
      res.status(400).json({ error: "Subdomain is required" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: {
        subDomain,
      },
    });

    if (project) {
      res.status(400).json({ error: "Subdomain already exists" });
      return;
    }

    res.status(200).json({ message: "Subdomain is available", subDomain });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST-ROUTE: create | for creating a new project
projectRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { error, data } = projectSchema.safeParse(req.body);
    if (error) {
      console.log("Validation Error:", error);
      res.status(400).json({ error: "Invalid request data" });
      return;
    }

    const { githubRepoUrl, subDomain } = data;

    const projectNameSlug = subDomain ? subDomain : generateSlug(2);
    console.log(`Generated Slug: ${projectNameSlug}`);

    const project = await prisma.project.create({
      data: {
        githubRepoUrl,
        subDomain: projectNameSlug,
        name: projectNameSlug, // TODO: maybe github project name should decide while creating frontend
        userId: "1", //TODO: get userId from auth middleware
      },
    });

    console.log("Project created:", project);
    res.status(201).json(project);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST-ROUTE: deploy | for deploying a project
// This route is responsible for deploying the project using AWS ECS
projectRouter.post("/deploy", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { githubRepoUrl, subDomain } = project;

    // Create deployemebt for the project
    console.log("Creating deployment for project:", projectId);

    // Check if there is an existing deployment in progress
    // If there is, return an error response
    const existingActiveDeployment = await prisma.deployment.findFirst({
      where: {
        projectId,
        status: {
          in: ["QUEUED", "IN_PROGRESS"],
        },
      },
    });
    if (existingActiveDeployment) {
      res.status(400).json({
        error: "Deployment already in progress",
        deploymentId: existingActiveDeployment.id,
      });
      return;
    }

    // Create a new deployment for the project
    // This will create a new deployment record in the database with status "QUEUED"
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        status: "QUEUED",
      },
    });

    console.log("Deployment created:", deployment);

    // Run the ECS task to deploy the project
    // This will trigger the ECS task to start deploying the project
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
              { name: "GIT_REPOSITORY_URL", value: githubRepoUrl },
              { name: "PROJECT_ID", value: projectId },
              { name: "AWS_REGION", value: process.env.AWS_REGION },
              { name: "DEPLOYMENT_ID", value: deployment.id },
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


    console.log("Running ECS task with command:", command);
    await ecsClient.send(command);
    console.log("Container runs successfully");

    // Update the deployment status to "IN_PROGRESS"
    await prisma.deployment.update({
      where: {
        id: deployment.id,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });
    console.log("Deployment status updated to IN_PROGRESS");

    res.status(200).json({
      subDomain,
      url: `http://${subDomain}.localhost:8000`,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
