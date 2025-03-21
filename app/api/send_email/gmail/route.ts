// app/api/send-email/gmail/route.js
import { auth } from "@/auth";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { oauth2Client } from "@/lib/init-oauth2-client";

/* send emails from the Users GMAIL */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First get the User's oauth account from the database directly
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.userId, session.userId),
    });

    if (!account) {
      return NextResponse.json(
        { error: "No account found for user" },
        { status: 401 }
      );
    }

    // This avoids re-creating the client on every request, which is good for performance.
    oauth2Client.setCredentials({
      // Set initial credentials from database
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // Check if token needs refreshing
    const isTokenExpired =
      account.expires_at && account.expires_at < Math.floor(Date.now() / 1000);

    if (isTokenExpired) {
      console.log("Token expired, refreshing...");

      if (!account.refresh_token) {
        return NextResponse.json(
          { error: "No refresh token available, please re-authenticate" },
          { status: 401 }
        );
      }

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;
        const newRefreshToken =
          credentials.refresh_token || account.refresh_token;
        const newExpiry = credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : Math.floor(Date.now() / 1000) + 3600;

        console.log(
          "Refreshed token expiry:",
          new Date(newExpiry * 1000).toISOString()
        );

        await db
          .update(accounts)
          .set({
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_at: newExpiry,
          })
          .where(eq(accounts.userId, session.userId));

        oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expiry_date: newExpiry * 1000,
        });
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return new NextResponse(
          "Error: Failed to refresh authentication token",

          { status: 401 }
        );
      }
    }

    // Parse request body or use defaults
    let { to, subject, body } = await req.json().catch(() => ({}));

    // Ensure `to` is an array of email addresses
    const recipients = Array.isArray(to) ? to : [to];

    // Generate HTML content from the emailBody (template blocks)
    let htmlContent = "<html><body>";
    if (body) {
      try {
        // Parse the email body if its a string
        const blocks = typeof body === "string" ? JSON.parse(body) : body;
        // Generate HTML from blocks
        blocks.forEach((block: string) => {
          switch (block.type) {
            case "header":
              htmlContent += `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">${block.content}</h1>`;
              break;
            case "text":
              htmlContent += `<p style="margin-bottom: 16px;">${block.content}</p>`;
              break;
            case "divider":
              htmlContent += `<hr style="border: none; border-top: ${
                block.content || "1px solid #EEEEEE"
              }; margin: 16px 0;">`;
              break;
            case "footer":
              htmlContent += `<p style="font-size: 14px; color: #777777; margin-top: 16px;">${block.content}</p>`;
              break;
          }
        });
      } catch (error) {
        console.error("Error parsing email body:", error);
        // Fallback to a default message if parsing fails
        htmlContent += "<p>Hello,</p><p>This is an email from Emprendy.</p>";
      }
    } else {
      // Fallback content if no emailBody is provided
      htmlContent += "<p>Hello,</p><p>This is an email from Emprendy.</p>";
    }

    // Close the HTML
    htmlContent += "</body></html>";

    // If we have an email in the session or account, use it
    const from = session.user?.email || "sender@example.com";

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Build email with proper headers
    const emailLines = [
      `From: ${from}`,
      `To: ${recipients.join(",")}`, // Join multiple recipients with commas
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      htmlContent,
    ];
    const raw = Buffer.from(emailLines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return NextResponse.json({
      success: true,
      messageId: res.data.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new NextResponse(
      "Internal server error",

      { status: 500 }
    );
  }
}
