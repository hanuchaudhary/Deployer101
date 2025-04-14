import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { clerkClient } from "@clerk/clerk-sdk-node";

//TODO: Migrate to new express-sdk clerk client

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
      response
        .status(401)
        .json({ error: "Unauthorized", message: "No token provided" });
      return;
    }

    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY || "";
    if (!publicKey) {
      response.status(500).json({ error: "Public key not set" });
      return;
    }

    // TODO : Fix this issue with the public key
    // const formattedKey = publicKey.replace(/\\n/g, "\n");
    
    const decodedToken = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: process.env.CLERK_ISSUER || "https://clerk.dev",
      complete: true,
    });

    if (!decodedToken) {
      console.log("Invalid token:", token);
      response
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid token" });
      return;
    }

    console.log("Decoded token:", decodedToken);
    
    const userId = decodedToken.payload.sub;
    if (!userId) {
      response
        .status(401)
        .json({ error: "Unauthorized", message: "No user ID in token" });
      return;
    }

    const user = await clerkClient.users.getUser(userId as string);
    if (!user) {
      response
        .status(401)
        .json({ error: "Unauthorized", message: "User not found" });
      return;
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
    response
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid token" });
  }
}
