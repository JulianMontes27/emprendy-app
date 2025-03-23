import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: { campaignId: string } }
) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { subject, emailBody } = await req.json();

    // Update the campaign in the database
    await db
      .update(campaigns)
      .set({
        settings: {
          subject,
          emailBody,
        },
      })
      .where(eq(campaigns.id, params.campaignId));

    return NextResponse.json({ message: "Campaign updated successfully" });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
