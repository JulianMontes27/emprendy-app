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
    const listId = formData.get("listId") as string | null;

    if (!file) {
      return new NextResponse("No file uploaded.", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawContacts = XLSX.utils.sheet_to_json(worksheet) as any[];

    // Basic validation
    if (!rawContacts || rawContacts.length === 0) {
      return new NextResponse("No contacts found in the file.", {
        status: 400,
      });
    }

    // Mapping the Excel columns to our database schema
    const mappedContacts = rawContacts.map((row) => {
      // Default mapping - can be customized based on the Excel file structure
      return {
        firstName: row.firstName || row.first_name || row["First Name"] || null,
        lastName: row.lastName || row.last_name || row["Last Name"] || null,
        email: row.email || row.Email || row["Email Address"] || "",
        companyName:
          row.companyName ||
          row.company ||
          row.Company ||
          row["Company Name"] ||
          null,
        jobTitle:
          row.jobTitle || row.title || row.Title || row["Job Title"] || null,
        phone: row.phone || row.Phone || row["Phone Number"] || null,
        linkedinUrl:
          row.linkedinUrl ||
          row.linkedin ||
          row.LinkedIn ||
          row["LinkedIn URL"] ||
          null,
        website: row.website || row.Website || null,
        industry: row.industry || row.Industry || null,
        companySize: row.companySize || row.size || row["Company Size"] || null,
        location: row.location || row.Location || null,
        source: "excel_import",
        notes: row.notes || row.Notes || null,
        tags: row.tags
          ? typeof row.tags === "string"
            ? row.tags.split(",")
            : row.tags
          : [],
        status: "active",
      };
    });

    // Validate crucial data
    const validationErrors = validateContacts(mappedContacts);
    if (validationErrors.length > 0) {
      return new NextResponse(JSON.stringify({ errors: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert contacts into database
    const insertedContacts = await db.transaction(async (tx) => {
      const inserted = [];

      for (const contact of mappedContacts) {
        // Check for duplicate email
        const existing = await tx.query.contacts.findFirst({
          where: (c, { eq, and }) =>
            and(eq(c.email, contact.email), eq(c.userId, user.id)),
        });

        if (!existing) {
          // Insert new contact
          const result = await tx.insert(contacts).values(contact).returning();
          inserted.push(result[0]);

          // If listId is provided, add contact to the list
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

    return NextResponse.json(
      {
        message: "Contacts imported successfully",
        totalProcessed: mappedContacts.length,
        inserted: insertedContacts.length,
        skipped: mappedContacts.length - insertedContacts.length,
        contacts: insertedContacts, // Return all inserted contacts
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing file:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
