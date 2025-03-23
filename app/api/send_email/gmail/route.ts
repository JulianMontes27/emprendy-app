// app/api/send-email/gmail/route.js
import { auth } from "@/auth";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, campaigns, emailTracking } from "@/db/schema"; // Import the new schema
import { eq } from "drizzle-orm";
import { oauth2Client } from "@/lib/init-oauth2-client";
import { nanoid } from "nanoid"; // You may need to install this package

// Helper functions for tracking
function generateEnhancedTrackingPixel(emailId: string, recipient: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const timestamp = Date.now(); // Prevent caching

  // Create multiple tracking images with different characteristics
  // return `
  //   <img src="${baseUrl}/api/track/open?id=${emailId}&r=${encodeURIComponent(
  //   recipient
  // )}&t=${timestamp}" width="1" height="1" alt="" style="display:block" />
  //   <div style="display:none;max-height:0px;overflow:hidden">
  //     <img src="${baseUrl}/api/track/open?id=${emailId}&r=${encodeURIComponent(
  //   recipient
  // )}&t=${timestamp}&v=2" width="2" height="2" alt="" />
  //   </div>
  // `;

  return `
    <img src="${baseUrl}/api/track/open?id=${emailId}&r=${encodeURIComponent(
    recipient
  )}&t=${timestamp}" width="1" height="1" alt="" style="display:block" />
    <div style="display:none;max-height:0px;overflow:hidden">
    </div>
  `;
}

function wrapLinksWithTracking(
  htmlContent: string,
  emailId: string,
  recipient: string
) {
  // Basic regex to find links - you might need a more robust solution
  return htmlContent.replace(
    /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']([^>]*)>(.*?)<\/a>/gi,
    function (match, url, attrs, text) {
      const trackingUrl = `${
        process.env.NEXT_PUBLIC_APP_URL
      }/api/track/click?url=${encodeURIComponent(
        url
      )}&email_id=${emailId}&recipient=${encodeURIComponent(recipient)}`;
      return `<a href="${trackingUrl}"${attrs}>${text}</a>`;
    }
  );
}

function addPrivacyDisclosure() {
  return `
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <p>Este correo electrónico contiene tecnología de seguimiento para ayudarnos a mejorar nuestras comunicaciones. Recopilamos información sobre cuándo se abre este correo electrónico y en qué enlaces se hace clic. Para cancelar el seguimiento, responda a este correo electrónico con "Cancelar suscripción" en el asunto.</p>
    </div>
  `;
}

/* send emails from the User's gmail */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.userId, session.userId),
    });
    if (!account) {
      return NextResponse.json(
        { error: "No account found for user" },
        { status: 401 }
      );
    }

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    const isTokenExpired =
      account.expires_at && account.expires_at < Math.floor(Date.now() / 1000);

    if (isTokenExpired) {
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

    let {
      to,
      subject,
      body,
      campaignId,
      trackingEnabled = true,
    } = await req.json();

    const recipients = Array.isArray(to) ? to : [to];

    let htmlContent = "<html><body>";
    if (body) {
      try {
        const blocks = typeof body === "string" ? JSON.parse(body) : body;
        blocks.forEach((block: any) => {
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
        htmlContent += "<p>Hello,</p><p>This is an email from Emprendy.</p>";
      }
    } else {
      htmlContent += "<p>Hello,</p><p>This is an email from Emprendy.</p>";
    }

    const emailId = nanoid();

    if (trackingEnabled) {
      await db.insert(emailTracking).values({
        id: emailId, // Explicitly set the ID
        userId: session.userId,
        campaignId: campaignId || null, // Allow null if no campaignId provided
        recipients: recipients.join(","),
        subject,
        sentAt: new Date(),
        status: "sent",
      });

      htmlContent += addPrivacyDisclosure();
    }

    // Update campaign status if campaignId is provided
    if (campaignId) {
      await db
        .update(campaigns)
        .set({
          status: "activa",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId));
    }

    htmlContent += "</body></html>";

    const from = session.user?.email || "sender@example.com";
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const sentMessageIds = [];

    for (const recipient of recipients) {
      let recipientHtmlContent = htmlContent;

      if (trackingEnabled) {
        recipientHtmlContent = recipientHtmlContent.replace(
          "</body>",
          // Every time this image (1x1) loads on the email client, the tracking routes are hit
          `${generateEnhancedTrackingPixel(emailId, recipient)}</body>`
        );
        recipientHtmlContent = wrapLinksWithTracking(
          recipientHtmlContent,
          emailId,
          recipient
        );
      }

      const emailLines = [
        `From: ${from}`,
        `To: ${recipient}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=utf-8",
      ];

      if (trackingEnabled) {
        emailLines.push("X-Tracking-Enabled: True");
      }

      emailLines.push("");
      emailLines.push(recipientHtmlContent);

      const raw = Buffer.from(emailLines.join("\r\n"))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      try {
        const res = await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw },
        });
        sentMessageIds.push(res.data.id);
      } catch (sendError) {
        console.error(`Error sending to ${recipient}:`, sendError);
      }
    }

    return NextResponse.json({
      success: true,
      messageIds: sentMessageIds,
      emailId: trackingEnabled ? emailId : null,
      trackingEnabled,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
