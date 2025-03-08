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
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = campaignSchema.safeParse(body);

    //     console.log(validationResult)
    //     {
    //   success: true,
    //   data: {
    //     campaignName: 'gngntkd',
    //     description: 'dsdsd',
    //     contactList: '95bf4dbb-b0ef-47dc-94a7-201c6f934b8d',
    //     template: 'networking',
    //     subject: 'dsdsds',
    //     emailBody: 'dsdsdsd',
    //     scheduleDate: '2025-03-17T05:00:00.000Z',
    //     isScheduled: true,
    //     sendFromName: 'Your Company',
    //     sendFromEmail: 'noreply@yourcompany.com',
    //     trackOpens: true,
    //     trackClicks: true
    //   }
    // }

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
      template,
      subject,
      emailBody,
      scheduleDate,
      isScheduled,
      sendFromName,
      sendFromEmail,
      trackOpens,
      trackClicks,
    } = validationResult.data;

    // Resolve template ID
    const templateResult = await db
      .select({ id: emailTemplates.id })
      .from(emailTemplates)
      .where(eq(emailTemplates.name, template))
      .limit(1);

    if (!templateResult.length) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const templateId = templateResult[0].id;

    // Determine campaign status
    let status = "draft";
    if (isScheduled) {
      status = "scheduled";
    }

    // Store email content and settings
    const settings = {
      subject,
      emailBody,
      contactList,
    };

    // Create the campaign
    const [campaign] = await db
      .insert(campaigns)
      .values({
        name: campaignName,
        description: description || null,
        createdById: session.user.id!,
        status,
        templateId,
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
      })
      .returning();

    // If not scheduled, add to queue
    if (!isScheduled) {
      await db.insert(emailQueue).values({
        campaignId: campaign.id,
        status: "queued",
        scheduledFor: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Trigger background job to send emails immediately
      // await queueService.triggerSendingProcess(campaign.id);
    }

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
