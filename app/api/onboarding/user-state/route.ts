import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

/* retrieve User onboarding state */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  if (!userId)
    return new NextResponse("No user_id search param found in the URL.");
  try {
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      finishedOnboarding: user.finishedOnboarding || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user state" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, finishedOnboarding, onboardingLastUpdated, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updatedAt = onboardingLastUpdated
      ? new Date(onboardingLastUpdated)
      : new Date();

    await db
      .update(users)
      .set({
        // Additional Onboarding Fields
        businessType: data.businessType,
        primaryGoal: data.primaryGoal,
        location: data.location,
        finishedOnboarding: true,
        onboardingLastUpdated: updatedAt,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "User state updated!" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user state" },
      { status: 500 }
    );
  }
}
