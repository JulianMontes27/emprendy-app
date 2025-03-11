import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate as Template } from "@/components/dashboard/templates/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

/* handle RESEND email POST */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign, template, contacts } = body;

    // Validate request data
    if (!campaign || !template || !contacts) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const emailRecipients = contacts.flatMap((contact: any) => contact.email);

    // Send emails using Resend
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: emailRecipients,
      // subject: campaign.settings.subject,
      subject: "Test email",
      react: Template({
        // subject: campaign.settings.subject,
        // body: campaign.settings.emailBody,
        subject: "TEST",
        body: "Test email",
      }) as React.ReactElement,
      replyTo: "",
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
