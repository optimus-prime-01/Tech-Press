import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

// Yeh function RabbitMQ se cache invalidation messages sunta hai
export const startCacheConsumer = async () => {
  try {
    // RabbitMQ server se connection banao
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbimq_Host, // RabbitMQ ka host
      port: 5672,
      username: process.env.Rabbimq_Username, // RabbitMQ user
      password: process.env.Rabbimq_Password, // RabbitMQ password
    });

    // Channel banao (ek tarah ka communication line)
    const channel = await connection.createChannel();

    const queueName = "cache-invalidation"; // Queue ka naam

    // Queue ko ensure karo ki exist karti ho
    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Blog Service cache consumer started");

    // Queue se messages suno (consume karo)
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          // Message ko JSON mein parse karo
          const content = JSON.parse(
            msg.content.toString()
          ) as CacheInvalidationMessage;

          console.log(
            "📩 Blog service recieved cache invalidation message",
            content
          );

          // Agar action invalidateCache hai
          if (content.action === "invalidateCache") {
            // Har pattern ke liye (jaise blogs:*)
            for (const pattern of content.keys) {
              // Redis mein matching keys dhoondo
              const keys = await redisClient.keys(pattern);

              if (keys.length > 0) {
                // Un keys ko delete kar do (cache invalidate)
                await redisClient.del(keys);

                console.log(
                  `🗑️ Blog service invalidated ${keys.length} cache keys matching: ${pattern}`
                );

                // (Optional) Cache ko turant fresh data se rebuild bhi kar sakte ho
                const category = "";
                const searchQuery = "";
                const cacheKey = `blogs:${searchQuery}:${category}`;

                // Database se fresh blogs le lo
                const blogs =
                  await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

                // Redis mein naya cache set kar do
                await redisClient.set(cacheKey, JSON.stringify(blogs), {
                  EX: 3600,
                });

                console.log("🔄️ Cache rebuilt with key:", cacheKey);
              }
            }
          }

          // Message ko acknowledge karo (RabbitMQ ko batao ki process ho gaya)
          channel.ack(msg);
        } catch (error) {
          console.error(
            "❌ Error processing cache invalidation in blog service:",
            error
          );

          // Agar error aaye toh message ko wapas queue mein daal do
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error("❌ Failed to start rabbitmq consumer");
  }
};