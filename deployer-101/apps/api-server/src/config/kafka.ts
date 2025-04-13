import { clickhouseClient, kafkaClient } from "./config";
import { v4 as uuidv4 } from "uuid";

const consumer = kafkaClient.consumer({ groupId: "api-server-logs-consumer" });
export const initKafkaConsumer = async () => {
  await consumer.connect();
  console.log("Kafka consumer connected");
  await consumer.subscribe({ topic: "logs" });

  await consumer.run({
    autoCommit: false,
    eachBatch: async ({
      batch,
      commitOffsetsIfNecessary,
      heartbeat,
      resolveOffset,
    }) => {
      const messages = batch.messages;
      console.log(`Received ${batch.messages.length} messages`);

      for (const message of messages) {
        try {
          const parsedMessage = JSON.parse(message.value?.toString() || "{}");
          console.log("Parsed message:", parsedMessage);
          const { PROJECT_ID, DEPLOYMENT_ID, log } = parsedMessage;

          if (!DEPLOYMENT_ID || !log) {
            console.error("Invalid message format:", parsedMessage);
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

          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
          await heartbeat();
        } catch (error) {
          console.error("Error inserting log event:", error);
          // Handle the error, e.g., retry or log it
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
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
