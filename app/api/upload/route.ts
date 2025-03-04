import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;
  if (!user)
    return new NextResponse("Client not authenticated. Please sign in.", {
      status: 403,
    });

  try {
    const formData = await req.formData(); // Parse incoming form data
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file uploaded.", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the file here (e.g., parse contents, validate data, etc.)
    console.log("Received file:", file.name);
    console.log("File size:", buffer.length, "bytes");

    console.log(arrayBuffer);

    return new NextResponse(
      JSON.stringify({
        message: "File processed successfully",
        fileName: file.name,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing file:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
