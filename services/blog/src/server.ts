import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5002;

startCacheConsumer();

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Redis connection with fallback
redisClient
  .connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((error) => {
    console.log("⚠️ Redis connection failed:", error.message);
    console.log("⚠️ Continuing without Redis cache");
  });

app.use("/api/v1", blogRoutes);

app.listen(port, () => {
  console.log(`🚀 Blog Service running on http://localhost:${port}`);
});