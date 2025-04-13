import { z } from "zod";

export const projectSchema = z.object({
  githubRepoUrl: z
    .string()
    .url("Invalid URL format")
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
      "URL must be a valid GitHub repository link"
    ),
  subDomain: z
    .string()
    .min(1, "Subdomain is required")
    .max(20, "Subdomain must be less than 20 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain can only contain lowercase letters, numbers, and hyphens"
    ),
  name: z.string().optional(), // Can still be optional, maybe later populated from GitHub
});
