import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { campaigns, emailTemplates } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Form Schema for Validation
const campaignSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  contactList: z.string().min(1, "Contact list is required"),
  template: z.string().min(1, "Template is required"), // This is coming as a string like "follow-up"
  subject: z.string().min(1, "Subject line is required"),
  emailBody: z.string().min(1, "Email body is required"),
  scheduleDate: z.string().optional().nullable(),
  isScheduled: z.boolean().default(false),
  sendFromName: z.string().default("Your Company"),
  sendFromEmail: z.string().default("noreply@yourcompany.com"),
  replyToEmail: z.string().optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    // Get the current authenticated user
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate request data
    const validationResult = campaignSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      campaignName,
      description,
      contactList,
      template, // This is a string ID like "follow-up", not a UUID
      subject,
      emailBody,
      scheduleDate,
      isScheduled,
      sendFromName,
      sendFromEmail,
      replyToEmail,
      trackOpens,
      trackClicks,
    } = validationResult.data;

    // First, look up the actual template UUID based on the provided string ID
    const templateResult = await db
      .select({ id: emailTemplates.id })
      .from(emailTemplates)
      .where(eq(emailTemplates.slug, template))
      .limit(1);

    if (!templateResult.length) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const templateId = templateResult[0].id;

    // Determine campaign status based on scheduling
    let status = "draft";
    if (isScheduled) {
      status = "scheduled";
    }

    // Store email content and settings in the settings JSON field
    const settings = {
      subject,
      emailBody,
      contactList,
      // Any other settings you want to include
    };

    // Create the campaign in the database using Drizzle
    const [campaign] = await db
      .insert(campaigns)
      .values({
        id: undefined, // Let Drizzle handle the UUID generation
        name: campaignName,
        description: description || null,
        createdById: session.user.id,
        status,
        templateId, // Now using the actual UUID from the database
        sendFromEmail,
        sendFromName,
        replyToEmail: replyToEmail || null,
        scheduledAt:
          isScheduled && scheduleDate ? new Date(scheduleDate) : null,
        sentAt: null,
        completedAt: null,
        trackOpens,
        trackClicks,
        settings,
        // createdAt and updatedAt will use defaultNow()
      })
      .returning();

    // If it's not scheduled for later, add to queue
    if (!isScheduled) {
      await db.insert(emailQueue).values({
        id: undefined,
        campaignId: campaign.id,
        status: "queued",
        scheduledFor: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // You might want to trigger a background job here
      // e.g., await queueService.triggerSendingProcess(campaign.id);
    }

    // Return the created campaign
    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully",
        data: campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campaign creation error:", error);

    return NextResponse.json(
      {
        error: "Failed to create campaign",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
