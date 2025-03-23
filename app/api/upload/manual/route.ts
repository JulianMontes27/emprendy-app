import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // db connection file
import { contacts } from "@/db/schema";
import { validateContacts } from "@/lib/api/validate-contacts";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Check if the user is authenticated
  if (!user || !user.id?.toString()) {
    return new NextResponse("Client not authenticated. Please sign in.", {
      status: 403,
    });
  }

  try {
    // Parse the JSON body from the request
    const body = await req.json();
    const { contacts: manualContacts } = body;

    // Validate crucial data
    const validationErrors = validateContacts(manualContacts);
    if (validationErrors.length > 0) {
      return new NextResponse(JSON.stringify({ errors: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Drizzle SQL transaction to handle multiple database operations
    const insertedContacts = await db.transaction(async (tx) => {
      const inserted = [];

      for (const contact of manualContacts) {
        // Check for existing contacts with the same email
        const existing = await tx.query.contacts.findFirst({
          where: (c, { eq, and }) =>
            and(eq(c.email, contact.email), eq(c.userId, user.id!)),
        });

        // If the contact doesn't exist, insert it
        if (!existing) {
          const result = await tx
            .insert(contacts)
            .values({
              ...contact,
              source: "manual_entry", // Indicate that this contact was added manually
              status: "active",
              userId: user.id,
            })
            .returning();

          inserted.push(result[0]);
        }
      }

      return inserted;
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Contacts added successfully",
        totalProcessed: manualContacts.length,
        inserted: insertedContacts.length,
        skipped: manualContacts.length - insertedContacts.length,
        contacts: insertedContacts,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing manual entry:", error);

    // Handle different types of errors
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: "Manual entry failed",
          details: error.message,
          // Include stack trace in development
          ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        }),
        {
          status: error.name === "ValidationError" ? 400 : 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fallback for unexpected errors
    return new NextResponse(
      JSON.stringify({
        error: "Unexpected error occurred during manual entry",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
