import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emailTemplates } from "@/db/schema";

/* server api route that handles /api/marketing/templates POST requests */
export async function POST(req: NextRequest) {
  // check for session
  const session = await auth();
  const user = session?.user;
  if (!user || !user.id) {
    return new NextResponse(
      "Not authenticated. Please sign in to continue creating. ",
      {
        status: 401,
      }
    );
  }
  try {
    const body = await req.json();
    const { name, subject, content, type, category, isActive } = body;
    // check if the MANDATORY fields are missing
    if (!name) {
      return NextResponse.json(
        {
          error: "Servidor no recibió el campo requerido (nombre).",
        },
        { status: 400 }
      );
    }
    // Insert values sent by the client in the db
    const [template] = await db
      .insert(emailTemplates)
      .values({
        name,
        createdById: user.id,
        subject: subject ? subject : null,
        content: content ? content : null,
        type: type ? type : null,
        category: category ? category : null,
        isActive: isActive ? isActive : null,
      })
      .returning();
    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully",
        data: template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal server error. Try again later.", {
      status: 500,
    });
  }
}
