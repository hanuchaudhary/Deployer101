import { prisma } from "@repo/database/client";
import { clickhouseClient, kafkaClient } from "./config";
import { v4 as uuidv4 } from "uuid";

// Consumer for logs topic
const logsConsumer = kafkaClient.consumer({ groupId: "api-server-logs-consumer" });

// Consumer for deployment-status topic
const statusConsumer = kafkaClient.consumer({ groupId: "api-server-status-consumer" });

export const logskafkaConsumer = async () => {
  await logsConsumer.connect();
  console.log("Logs consumer Connected✅");
  await logsConsumer.subscribe({ topic: "logs", fromBeginning: false });

  await logsConsumer.run({
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

          const { PROJECT_ID, DEPLOYMENT_ID, log } = parsedMessage;

          if (!DEPLOYMENT_ID || !log) {
            console.error("Invalid log message format:", parsedMessage);
            continue; // Skip invalid messages
          }

          const values = {
            event_id: uuidv4(),
            project_id: PROJECT_ID || null, // Handle optional project_id
            deployment_id: DEPLOYMENT_ID,
            log,
            timestamp: new Date().toISOString(),
          };
          console.log("Inserting into ClickHouse:", values);

          const res = await clickhouseClient.insert({
            table: "log_events",
            values: [values],
            format: "JSONEachRow",
          });

          console.log("ClickHouse insert response:", res);
          console.log(`Inserted log event for deployment ${DEPLOYMENT_ID}`);

          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
        } catch (error) {
          console.error("Error inserting log event:", error, {
            message: message.value?.toString(),
            offset: message.offset,
          });
        }
      }
    },
  });
};

export const statusKafkaConsumer = async () => {
  await statusConsumer.connect();
  console.log("Deployment Status consumer Connected✅");
  await statusConsumer.subscribe({
    topic: "deployment-status",
    fromBeginning: false,
  });

  await statusConsumer.run({
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
          const { PROJECT_ID, DEPLOYMENT_ID, status, error } = parsedMessage;

          if (!DEPLOYMENT_ID || !status) {
            console.error("Invalid deployment status message format:", parsedMessage);
            continue;
          }

          await prisma.deployment.update({
            where: { id: DEPLOYMENT_ID },
            data: {
              status,
              ...(error && { error }),
            },
          });

          console.log(`Updated deployment ${DEPLOYMENT_ID} to status ${status}`);

          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
        } catch (error) {
          console.error("Error processing status message:", error, {
            message: message.value?.toString(),
            offset: message.offset,
          });
        }
      }
    },
  });
};

// Start both consumers
export const startConsumers = async () => {
  try {
    await Promise.all([logskafkaConsumer(), statusKafkaConsumer()]);
  } catch (err) {
    console.error("Error starting consumers:", err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down...");
  try {
    await Promise.all([logsConsumer.disconnect(), statusConsumer.disconnect()]);
    console.log("Kafka consumers disconnected");
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