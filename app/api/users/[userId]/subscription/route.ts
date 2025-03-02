import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { subscriptions } from "@/db/schema";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userId: string;
    };
  }
) {
  try {
    // Fetch the subscription data for the given userId
    const subscriptionData = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, params.userId))
      .catch((error) => {
        console.error("Database error:", error);
        throw new Error("Failed to fetch subscription data");
      });

    // If no subscription data is found, return a 200 response with null
    if (!subscriptionData.length) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    // Return the subscription data
    return NextResponse.json({ data: subscriptionData[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
