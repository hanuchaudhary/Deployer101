import { z } from "zod";

export const projectSchema = z.object({
  githubUrl: z
    .string()
    .url("Invalid URL format")
    .refine((url: string) => /github\.com/.test(url), {
      message: "URL must be a GitHub URL",
    }),
  subDomain: z
    .string()
    .min(1, "Subdomain is required")
    .max(20, "Subdomain must be less than 20 characters"),
});
