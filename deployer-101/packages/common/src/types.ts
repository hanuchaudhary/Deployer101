export interface UserType {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  githubUsername: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  projects: ProjectType[]; // One-to-many: User can have multiple projects
}

export interface ProjectType {
  id: string;
  name: string;
  githubRepoUrl: string;
  subDomain: string;
  customDomain: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: UserType;
  deployments: DeploymentType[];
}

export type DEPLOYMENT_STATUS =
  | "IDLE"
  | "READY"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "QUEUED";

export interface DeploymentType {
  id: string;
  projectId: string;
  project: ProjectType;
  status: DEPLOYMENT_STATUS;
  createdAt: string;
  updatedAt: string;
}
