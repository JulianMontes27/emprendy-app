"use client";

import sendEmail from "@/actions/send-email";
// import { Campaign, Contact, EmailTemplate } from "@/types/types";

const StartCampaignButton = ({
  campaign,
  template,
  contacts,
}: {
  campaign: any;
  template: any;
  contacts: any;
}) => {
  const handleSubmit = async (formData: FormData) => {
    // Add campaign, template, and lists data to the form data
    formData.append("campaign", JSON.stringify(campaign));
    formData.append("template", JSON.stringify(template));
    formData.append("contacts", JSON.stringify(contacts));

    // Call the server action
    await sendEmail(formData);
  };

  return (
    <form action={handleSubmit}>
      <button type="submit">Comenzar campaña</button>
    </form>
  );
};

export default StartCampaignButton;
