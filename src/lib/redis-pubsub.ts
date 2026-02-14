import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "https://vocal-reindeer-41955.upstash.io";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "AaPjAAIncDIzYjYyNmFlYTdlZDk0YTBhOWUzOGRmNjU5OGM0ZGUwOXAyNDE5NTU";

let publisher: Redis | null = null;

export function getRedisPublisher() {
  if (!publisher) {
    publisher = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    });
  }
  return publisher;
}

interface OrderUpdatePayload {
  status: string;
  userId?: string;
}

export async function publishOrderUpdate(orderId: string, update: OrderUpdatePayload) {
  const publisher = getRedisPublisher();
  const message = JSON.stringify({ orderId, ...update, timestamp: Date.now() });
  console.log("[Redis] Publishing:", message);
  await publisher.publish("order-updates", message);
  console.log("[Redis] Published successfully");
}
