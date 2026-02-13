import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "https://vocal-reindeer-41955.upstash.io";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "AaPjAAIncDIzYjYyNmFlYTdlZDk0YTBhOWUzOGRmNjU5OGM0ZGUwOXAyNDE5NTU";

export const dynamic = "force-dynamic";

async function getOrderUpdates(redis: Redis, userId: string): Promise<any[]> {
  const key = `order-updates:${userId}`;
  const updates = await redis.lrange(key, 0, -1);
  if (updates.length > 0) {
    await redis.del(key);
  }
  return updates as any[];
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch (e) {
        }
      };

      sendEvent({ type: "connected", message: "SSE connection established" });

      const interval = setInterval(async () => {
        try {
          const updates = await getOrderUpdates(redis, userId);
          for (const update of updates) {
            sendEvent(update);
          }
        } catch (error) {
          console.error("Error fetching order updates:", error);
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
