import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import based on your Drizzle setup
import { campaigns } from "@/db/schema"; // Adjust the import based on your schema location
import { eq } from "drizzle-orm";

// API route for updating campaign data
export async function POST(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;

    // Parse the incoming JSON data
    const body = await request.json();
    console.log("Received update data:", body);

    // Extract fields from the request body
    const { subject, emailBody } = body;

    // Fetch the existing campaign to get the current settings
    const existingCampaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!existingCampaign.length) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const currentSettings = existingCampaign[0].settings || {};

    // Prepare the updated settings object
    const updatedSettings = {
      ...currentSettings, // Preserve existing settings
      subject, // Update subject
      emailBody, // Update email body
    };

    // Update the campaign in the database
    const updatedCampaign = await db
      .update(campaigns)
      .set({
        settings: updatedSettings, // Update the settings JSON field
        updatedAt: new Date(), // Update the timestamp
      })
      .where(eq(campaigns.id, campaignId))
      .returning(); // Return the updated campaign

    console.log("Updated campaign:", updatedCampaign);

    // Return a success response
    return NextResponse.json(
      {
        message: "Campaign updated successfully",
        campaign: updatedCampaign[0], // Return the first (and only) updated campaign
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating campaign:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
