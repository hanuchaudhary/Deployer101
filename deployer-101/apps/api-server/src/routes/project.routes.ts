import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { Request, Response, Router } from "express";
import { generateSlug } from "random-word-slugs";
import { clickhouseClient, ecsClient } from "../config/config";
import { projectSchema } from "@repo/common/validations";
import { prisma } from "@repo/database/client";
import { authMiddleware } from "../middleware";

export const projectRouter: Router = Router();
projectRouter.use(authMiddleware);

const USER_ID = "8362bceb-3cf6-4f8c-b4e2-662ea138e998";

// POST-ROUTE: domain | for checking if the subdomain is available
projectRouter.post("/domain", async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    if (!domain) {
      res.status(400).json({ error: "Domain is required" });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { subDomain: domain },
          { customDomain: domain }
        ]
      }
    });

    if (project) {
      res.status(400).json({ error: "Domain already exists" });
      return;
    }

    res.status(200).json({ Message: "Domain is available", domain });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST-ROUTE: create | for creating a new project
projectRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { error, data } = projectSchema.safeParse(req.body);
    if (error) {
      console.log("Validation Error:", error);
      res.status(400).json({ error: "Invalid request data" });
      return;
    }

    const { githubRepoUrl, subDomain, projectName } = data;
    console.log({
      githubRepoUrl,
      subDomain,
      projectName
    });
    

    const projectNameSlug = subDomain ? subDomain : generateSlug(2);

    // Check if the subdomain is available
    const existingProject = await prisma.project.findUnique({
      where: {
        subDomain: projectNameSlug,
      },
    });
    if (existingProject) {
      res.status(400).json({ error: "Subdomain already exists" });
      return;
    }

    // Check if the project already exists for the user with the same repo URL
    const existingProjectForUser = await prisma.project.findFirst({
      where: {
        userId: USER_ID, //TODO: get userId from auth middleware ✅
        githubRepoUrl: githubRepoUrl,
      },
    });

    if (existingProjectForUser) {
      res
        .status(400)
        .json({ error: "Project already for this Github Repositories" });
      return;
    }

    const project = await prisma.project.create({
      data: {
        githubRepoUrl,
        subDomain: projectNameSlug,
        name: projectName || "", // TODO: maybe github project name should decide while creating frontend
        userId: USER_ID, //TODO: get userId from auth middleware ✅
      },
    });

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
        userId : USER_ID
      },
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const { githubRepoUrl, subDomain, customDomain } = project;

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
                name: "AWS_BUCKET_NAME",
                value: process.env.AWS_BUCKET_NAME,
              },
              {
                name: "KAFKA_BROKER",
                value: process.env.KAFKA_BROKER,
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
      deploymentId: deployment.id,
      message: "Deployment started successfully",
      status: "IN_PROGRESS",
      url: `http://${customDomain ? customDomain : subDomain}.localhost:8000`,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET-ROUTE: get | for getting a project by ID
projectRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include:{
        deployments: true, // Include the deployments relation
      }
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET-ROUTE: get-all | for getting all projects
projectRouter.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: USER_ID, //TODO: get userId from auth middleware ✅
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE-ROUTE: delete | for deleting a project by ID
projectRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    await prisma.project.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET-ROUTE: get-deployments | for getting all deployments of a project
projectRouter.get("/:id/deployments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },select:{
        deployments: true, // Include the deployments relation
      }
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json({ deployments: project.deployments || [] });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET-ROUTE: get-logs | for getting logs of a deployment
projectRouter.get("/logs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Deployment ID is required" });
      return;
    }
    const deployment = await prisma.deployment.findUnique({
      where: {
        id,
      },
    });
    if (!deployment) {
      res.status(404).json({ error: "Deployment not found" });
      return;
    }
    // Fetch logs from ClickHouse using the deployment ID
    const logs = await clickhouseClient.query({
      query: `SELECT event_id, deployment_id, log, timestamp FROM log_events WHERE deployment_id = {deployment_id : String}`,
      format: "JSONEachRow",
      query_params: {
        deployment_id: deployment.id,
      },
    });

    const finalLogs = await logs.json();

    console.log("Logs: for ",deployment.id,finalLogs);
    res.status(200).json(finalLogs);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error", dbError: error });
  }
});
