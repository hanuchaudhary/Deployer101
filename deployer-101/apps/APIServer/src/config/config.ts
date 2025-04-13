import { ECSClient } from "@aws-sdk/client-ecs";
import Redis from "ioredis";
import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import { createClient } from "@clickhouse/client";

// ECS Client configuration
export const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});


// Redis Client configuration
export const redisClient = new Redis(process.env.REDIS_URL || "");


// Kafka Client configuration
export const kafka = new Kafka({
  clientId: `api-server`,
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    mechanism: "plain",
  },
});

// ClickHouse Client configuration
export const clickhouseClient = createClient({
  host: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE,
});