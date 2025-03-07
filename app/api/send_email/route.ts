import { EmailTemplate } from "@/components/email/email-template";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, msg } = body;

    // Validate request data
    if (!name || !email || !msg) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["julianmontesps4@gmail.com"],
      subject: "Interesado en Club de Tenis de Bocagrande",
      react: EmailTemplate({ name, email, msg }) as React.ReactElement,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
