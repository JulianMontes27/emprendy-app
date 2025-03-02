"use server";

import { EmailTemplate } from "@/components/email/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmail(formData: FormData) {
  console.log(formData);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || typeof name !== "string") {
    return { error: "Invalid message." };
  }
  if (!email || typeof email !== "string") {
    return { error: "Please verify your email." };
  }
  if (!message || typeof message !== "string") {
    return { error: "Please verify your email." };
  }

  try {
    /* Mutate data on the server */
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["julianmontesps4@gmail.com"],
      subject: "Club de Tenis de Bocagrande",
      react: EmailTemplate({ name, email, message }) as React.ReactElement,
      replyTo: email,
    });

    if (error) {
      return {
        error,
      };
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
