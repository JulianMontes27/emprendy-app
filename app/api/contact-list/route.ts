import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts, lists, contactsToLists } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  // Check if the user is authenticated
  if (!user) {
    return new NextResponse("Client not authenticated. Please sign in.", {
      status: 403,
    });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { name, description, contacts: contactIds } = body;

    // Validate required fields
    if (
      !name ||
      !contactIds ||
      !Array.isArray(contactIds) ||
      contactIds.length === 0
    ) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request",
          details: "Name and at least one contact are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify all contacts exist and belong to this user
    const existingContacts = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(
        and(eq(contacts.userId, user.id!), inArray(contacts.id, contactIds))
      );

    // Get the list of valid contact IDs
    const validContactIds = existingContacts.map((contact) => contact.id);

    // Check if all provided contacts exist and belong to the user
    if (validContactIds.length !== contactIds.length) {
      const invalidIds = contactIds.filter(
        (id) => !validContactIds.includes(id)
      );
      return new NextResponse(
        JSON.stringify({
          error: "Invalid contacts",
          details: `Some contacts do not exist or don't belong to this user: ${invalidIds.join(
            ", "
          )}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a new list in a transaction
    const result = await db.transaction(async (tx) => {
      // Create the list
      const [newList] = await tx
        .insert(lists)
        .values({
          name,
          description,
          createdById: user.id!,
          isActive: true,
        })
        .returning();

      // Create the many-to-many relationships
      const contactListRelations = validContactIds.map((contactId) => ({
        contactId,
        listId: newList.id,
      }));

      // Insert the relationships
      if (contactListRelations.length > 0) {
        await tx.insert(contactsToLists).values(contactListRelations);
      }

      return newList;
    });

    // Return a success response
    return NextResponse.json(
      {
        message: "List created successfully",
        data: {
          list: result,
          contactCount: validContactIds.length,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // Handle errors
    console.error("Error creating list:", error);

    // Different error responses based on error type
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: "List creation failed",
          details: error.message,
          // Optionally include stack trace in development
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
        error: "Unexpected error occurred during list creation",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
