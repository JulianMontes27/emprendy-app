"use server";

import { EmailTemplate as Template } from "@/components/dashboard/templates/email-templates";
import { Campaign, EmailTemplate } from "@/types/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail(formData: FormData) {
  try {
    // Parse form data
    const campaign = JSON.parse(formData.get("campaign") as string) as Campaign;
    const template = JSON.parse(
      formData.get("template") as string
    ) as EmailTemplate;
    const contacts = JSON.parse(formData.get("contacts") as string) as any[];
    let emailRecipients = contacts.flatMap((contact) => contact.email);
    emailRecipients.push("julianmontesps4@gmail.com");

    // Send emails using Resend
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["julianmontesps4@gmail.com"],
      // subject: campaign.settings.subject,
      subject: "Test email",
      react: Template({
        // subject: campaign.settings.subject,
        // body: campaign.settings.emailBody,
        subject: "TEST",
        body: "Test email",
      }) as React.ReactElement,
      replyTo: "" ,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error: "Failed to send email." };
  }
}
