import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailClicks } from "@/db/schema";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const emailId = searchParams.get("email_id");
  const recipient = searchParams.get("recipient");
  const url = new URL(req.url);
  const urlString: string = url.toString();

  if (!emailId || !recipient || !url) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  try {
    // Log the click event
    await db.insert(emailClicks).values({
      id: crypto.randomUUID(), // Generate UUID
      emailId,
      recipient,
      url: urlString,
      clickedAt: new Date(),
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    // Redirect to the original URL
    return NextResponse.redirect(decodeURIComponent(urlString));
  } catch (error) {
    console.error("Error tracking click:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
