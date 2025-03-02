import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "./limiter";

// Middleware for rate limiting API requests
export async function apiRateLimitMiddleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (remaining === 0) {
    return new Response(
      JSON.stringify({
        error: "Too many API calls", // TODO: internationalise
      }),
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }
  console.log(success);
  return NextResponse.next();
}
