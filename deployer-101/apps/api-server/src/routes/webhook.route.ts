import { prisma } from "@repo/database/client";
import { Request, Response, Router } from "express";
import { Webhook, WebhookVerificationError } from "svix";

export const webhookRouter = Router() as Router;

webhookRouter.post("/", async (req: Request, res: Response) => {
  const SIGNING_KEY = process.env.SIGNING_KEY || "";
  if (!SIGNING_KEY) {
    res.status(500).json({ error: "SIGNING_KEY not set" });
    return;
  }

  const webhook = new Webhook(SIGNING_KEY);
  const headers = req.headers;
  const body = req.body;

  const svixId = headers["svix-id"] as string;
  const svixSignature = headers["svix-signature"] as string;
  const svixTimestamp = headers["svix-timestamp"] as string;

  if (!svixId || !svixSignature || !svixTimestamp) {
    res.status(400).json({ error: "Missing headers" });
    return;
  }

  let event: any;

  try {
    event = webhook.verify(JSON.stringify(body), {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    });
    console.log("Event Verified");
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error("Webhook verification error:", error.message);
      res.status(400).json({ error: "Webhook verification failed" });
      return;
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "Internal server error", error: error });
      return;
    }
  }

  const { id } = event.data;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated":
        await prisma.user.upsert({
          where: {
            clerkId: id,
          },
          update: {
            clerkId: id,
            name: `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim(),
            email: event.data.email_addresses[0].email_address,
            profileImage: event.data.profile_image_url,
            githubUsername : event.data.username,
          },
          create: {
            clerkId: id,
            name: `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim(),
            email: event.data.email_addresses[0].email_address,
            profileImage: event.data.profile_image_url,
            githubUsername : event.data.username,
          },
        });
        break;
      case "user.deleted":
        await prisma.user.delete({
          where: {
            clerkId: id,
          },
        });
        break;

      default:
        console.log("Unhandled event type:", eventType);
        break;
    }
    console.log("Event processed successfully:", eventType);
  } catch (error) {
    console.error("Error processing event:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  res.status(200).json({ message: "Webhook received and processed" });
});
