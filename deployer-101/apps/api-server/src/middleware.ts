import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        email: string;
      };
    }
  }
}

export async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const headers = request.headers["authorization"] as string;
    const token = headers.split(" ")[1];

    if (!token) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY || "";
    if (!publicKey) {
      return response.status(500).json({ error: "Public key not set" });
    }

    const formattedKey = publicKey.replace(/\\n/g, "\n");
    const decodedToken = jwt.verify(token, formattedKey, {
      algorithms: ["RS256"],
      issuer: process.env.CLERK_ISSUER || `https://api.clerk.com`,
      complete: true,
    });

    if (!decodedToken) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const userId = decodedToken.payload.sub;
    if (!userId) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId as string);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    request.userId = userId as string;
    request.user = {
      email:
        user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId
        )?.emailAddress || "",
    };

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return response.status(401).json({ error: "Unauthorized" });
  }
}
