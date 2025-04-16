import { prisma } from "@repo/database/client";
import { clickhouseClient, kafkaClient } from "./config";
import { v4 as uuidv4 } from "uuid";
const consumer = kafkaClient.consumer({ groupId: "api-server-logs-and-status-consumer" });

export const initKafkaConsumer = async () => {
  await consumer.connect();
  console.log("Kafka consumer connected");

  // Subscribe to both logs and deployment-status topics
  await consumer.subscribe({ topics: ["logs", "deployment-status"], fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachBatch: async ({
      batch,
      commitOffsetsIfNecessary,
      heartbeat,
      resolveOffset,
    }) => {
      const messages = batch.messages;
      console.log(`Received ${messages.length} messages from topic ${batch.topic}`);

      for (const message of messages) {
        try {
          const parsedMessage = JSON.parse(message.value?.toString() || "{}");
          console.log("Parsed message:", parsedMessage);

          if (batch.topic === "logs") {
            // Handle logs topic (insert into ClickHouse)
            const { PROJECT_ID, DEPLOYMENT_ID, log } = parsedMessage;

            if (!DEPLOYMENT_ID || !log) {
              console.error("Invalid log message format:", parsedMessage);
              continue; // Skip invalid messages
            }

            await clickhouseClient.insert({
              table: "log_events",
              values: [
                {
                  event_id: uuidv4(),
                  project_id: PROJECT_ID || null, // Handle optional project_id
                  deployment_id: DEPLOYMENT_ID,
                  log,
                  timestamp: new Date().toISOString(),
                },
              ],
              format: "JSONEachRow",
            });

            console.log(`Inserted log event for deployment ${DEPLOYMENT_ID}`);
          } else if (batch.topic === "deployment-status") {
            // Handle deployment-status topic (update Prisma database)
            const { PROJECT_ID, DEPLOYMENT_ID, status, error } = parsedMessage;

            if (!DEPLOYMENT_ID || !status) {
              console.error("Invalid deployment status message format:", parsedMessage);
              continue; // Skip invalid messages
            }

            await prisma.deployment.update({
              where: { id: DEPLOYMENT_ID },
              data: {
                status,
                ...(error && { error }), // Update error field if provided
              },
            });

            console.log(`Updated deployment ${DEPLOYMENT_ID} to status ${status}`);
          } else {
            console.error("Unknown topic:", batch.topic);
            continue; // Skip messages from unexpected topics
          }

          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
        } catch (error) {
          console.error(`Error processing message from topic ${batch.topic}:`, error);
          // Optionally retry or log to a dead-letter queue
          // For now, continue to avoid blocking the consumer
        }
      }
    },
  });
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down...");
  try {
    await consumer.disconnect();
    console.log("Kafka consumer disconnected");
    await prisma.$disconnect();
    console.log("Prisma client disconnected");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);