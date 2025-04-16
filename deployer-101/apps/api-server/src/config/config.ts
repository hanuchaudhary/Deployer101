import { ECSClient } from "@aws-sdk/client-ecs";
import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import { createClient } from "@clickhouse/client";
import dotenv from "dotenv";
dotenv.config();

// ECS Client configuration
export const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Kafka Client configuration
const certsPath = path.join(__dirname, "../certs");
export const kafkaClient = new Kafka({
  clientId: "api-server",
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(certsPath, "ca.pem"), "utf-8")],
    cert: fs.readFileSync(path.join(certsPath, "service.cert"), "utf-8"),
    key: fs.readFileSync(path.join(certsPath, "service.key"), "utf-8"),
  },
});

// ClickHouse Client configuration
export const clickhouseClient = createClient({
  username: process.env.CLICKHOUSE_USER,
  database: process.env.CLICKHOUSE_DATABASE,
  url: process.env.CLICKHOUSE_URL,
});




// Kafka Client configuration
// export const kafkaCient = new Kafka({
//   clientId: `api-server`,
//   brokers: [process.env.KAFKA_BROKER!],
//   // ssl: {
//   //   ca: [fs.readFileSync(path.join(__dirname, "../certs/ca.pem"), "utf-8")],

//   // },
//   sasl: {
//     username: process.env.KAFKA_USERNAME!,
//     password: process.env.KAFKA_PASSWORD!,
//     mechanism: "plain",
//   },
// });
