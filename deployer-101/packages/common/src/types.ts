export interface UserType {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  githubUsername: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
  projects: ProjectType[]; // One-to-many: User can have multiple projects
}

export interface ProjectType {
  id: string;
  name: string;
  githubRepoUrl: string;
  subDomain: string;
  customDomain: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: UserType;
  deployments: DeploymentType[];
}

export enum DEPLOYMENT_STATUS {
  IDLE = "IDLE", // No deployment in progress
  READY = "READY", // Ready for deployment
  IN_PROGRESS = "IN_PROGRESS", // Deployment in progress
  SUCCESS = "SUCCESS", // Deployment successful
  FAILED = "FAILED", // Deployment failed
  CANCELLED = "CANCELLED", // Deployment cancelled
  QUEUED = "QUEUED", // Deployment queued
}

export interface DeploymentType {
  id: string;
  projectId: string;
  project: ProjectType;
  status: DEPLOYMENT_STATUS;
  createdAt: Date;
  updatedAt: Date;
}
