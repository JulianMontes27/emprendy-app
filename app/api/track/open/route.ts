import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailOpens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// example request uRL =  GET /api/track/open?id=8tsSHOb4D26jUe1TiihhE&r=julianmontesps4%40gmail.com&t=1742761053733 400 in 9ms
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");
    const recipient = url.searchParams.get("r");
    const timestamp = url.searchParams.get("t");

    if (!emailId || !recipient) {
      console.error("Missing tracking parameters:", { emailId, recipient });
      return new NextResponse("Missing id or r", { status: 400 });
    }

    const decodedRecipient = decodeURIComponent(recipient);

    // Upsert: Insert if new, update if exists
    await db
      .insert(emailOpens)
      .values({
        id: crypto.randomUUID(),
        emailId,
        recipient: decodedRecipient,
        openedAt: new Date(),
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      })
      .onConflictDoUpdate({
        target: [emailOpens.emailId, emailOpens.recipient], // Unique constraint columns
        set: {
          openedAt: new Date(), // Update timestamp on subsequent opens
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      });

    console.log("Open tracked or updated:", {
      emailId,
      recipient: decodedRecipient,
    });
    // Convert a base64-encoded string into a binary buffer
    // Base64 String: This specific string represents a 1x1 transparent PNG image (a common tracking pixel). It’s tiny and invisible when rendered.
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/iglAAAAAElFTkSuQmCC",
      "base64"
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error tracking open:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
