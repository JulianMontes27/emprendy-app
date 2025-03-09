import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { campaigns, emailQueue, campaignsToLists } from "@/db/schema";
import { z } from "zod";

const campaignSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  contactList: z.string().min(1, "Contact list is required"), // This is the list ID
  template: z.string().min(1, "Template ID is required"),
  subject: z.string().optional(),
  emailBody: z.string().optional(),
  scheduleDate: z.string().optional(), // Accept scheduleDate as a string
  isScheduled: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = campaignSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.format());
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      campaignName,
      description,
      contactList, // This is the list ID
      template,
      subject,
      emailBody,
      scheduleDate,
      isScheduled,
    } = validationResult.data;

    // Convert scheduleDate to a Date object if it exists
    const scheduledAt = scheduleDate ? new Date(scheduleDate) : null;

    // Determine campaign status
    let status = "borrador";
    if (isScheduled) {
      status = "programado";
    }

    // Store email content and settings
    const settings = {
      subject,
      emailBody,
      contactList,
    };

    // Create the campaign in a transaction
    await db.transaction(async (tx) => {
      // Insert the campaign
      const [campaign] = await tx
        .insert(campaigns)
        .values({
          name: campaignName,
          description: description || null,
          createdById: session.user?.id!,
          status,
          templateId: template,
          sendFromEmail: session.user?.email,
          sendFromName: session.user?.name,
          scheduledAt,
          sentAt: null,
          completedAt: null,
          trackOpens: true,
          trackClicks: true,
          settings,
        })
        .returning();

      // Create the many-to-many relationship between the campaign and the list
      await tx.insert(campaignsToLists).values({
        campaignId: campaign.id,
        listId: contactList, // Use the list ID from the request
      });

      // If not scheduled, add to queue
      if (!isScheduled) {
        await tx.insert(emailQueue).values({
          campaignId: campaign.id,
          status: "queued",
          scheduledFor: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully",
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
