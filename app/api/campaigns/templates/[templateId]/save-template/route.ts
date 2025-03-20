import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import based on your Drizzle setup
import { emailTemplates } from "@/db/schema"; // Adjust the import based on your schema location
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    console.log("Template ID:", templateId);

    // Parse the incoming JSON data
    const body = await request.json();
    console.log("Received template:", body);

    // Parse the `content` field if it's a JSON string
    let parsedContent = body.content;
    if (typeof body.content === "string") {
      try {
        parsedContent = JSON.parse(body.content);
      } catch (error) {
        console.error("Error parsing content:", error);
        throw new Error("Invalid content format");
      }
    }

    // Update the template in the database
    const updatedTemplate = await db
      .update(emailTemplates)
      .set({
        name: body.name,
        subject: body.subject,
        content: JSON.stringify(parsedContent), // Save as JSON string
        variables: body.variables,
        category: body.category,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId))
      .returning(); // Return the updated template

    console.log("Updated template:", updatedTemplate);

    // Return a success response
    return NextResponse.json(
      { message: "Template saved successfully", template: updatedTemplate },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving template:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}
