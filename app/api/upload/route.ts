import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/db"; // Assuming you have a db connection file
import { contacts } from "@/db/schema"; // Import your schema
import { validateContacts } from "@/lib/api/validate-contacts";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;
  if (!user)
    return new NextResponse("Client not authenticated. Please sign in.", {
      status: 403,
    });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mappedContactsJson = formData.get("mappedContacts") as string | null;
    const listId = formData.get("listId") as string | null;

    if (!file || !mappedContactsJson) {
      return new NextResponse("No file uploaded.", { status: 400 });
    }
    // Before processing the file
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse("File too large. Maximum 10MB allowed.", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Parse mapped contacts
    const mappedContacts = JSON.parse(mappedContactsJson);

    // Validate crucial data
    const validationErrors = validateContacts(mappedContacts);
    if (validationErrors.length > 0) {
      return new NextResponse(JSON.stringify({ errors: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rest of the import logic remains the same
    const insertedContacts = await db.transaction(async (tx) => {
      const inserted = [];

      for (const contact of mappedContacts) {
        // Existing duplicate and insert logic
        const existing = await tx.query.contacts.findFirst({
          where: (c, { eq, and }) =>
            and(eq(c.email, contact.email), eq(c.userId, user.id)),
        });

        if (!existing) {
          const result = await tx
            .insert(contacts)
            .values({
              ...contact,
              source: "excel_import",
              status: "active",
              userId: user.id,
            })
            .returning();

          inserted.push(result[0]);

          // List association logic
          if (listId) {
            await tx.insert(contactLists).values({
              contactId: result[0].id,
              listId: listId,
              addedAt: new Date(),
            });
          }
        }
      }

      return inserted;
    });

    console.log(contacts);

    return NextResponse.json(
      {
        message: "Contacts imported successfully",
        totalProcessed: mappedContacts.length,
        inserted: insertedContacts.length,
        skipped: mappedContacts.length - insertedContacts.length,
        contacts: insertedContacts,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Modify the catch block
    console.error("Error processing file:", error);

    // Different error responses based on error type
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          error: "Import failed",
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
        error: "Unexpected error occurred during import",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
