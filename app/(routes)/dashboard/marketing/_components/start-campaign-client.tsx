"use client";

import axios from "axios";
import toast from "react-hot-toast";

interface StartCampaignButtonProps {
  campaign: any;
  template: any;
  contacts: any[];
}
// this button is not Progressive-enhanced, meaning that we control with JS the flow of the  submition
const StartCampaignButton: React.FC<StartCampaignButtonProps> = ({
  campaign,
  template,
  contacts,
}) => {
  // define the on-submit handler
  const onSubmit = async () => {
    /* Send POST to the API server */
    await axios
      .post("/api/send_email", {
        campaign,
        template,
        contacts,
      })
      .then(() => {
        toast.success(
          "Tu correo ha sido enviado. Pronto nos pondremos en contacto contigo.",
          {
            duration: 4000,
            position: "top-center",
            // Change colors of success/error/loading icon

            // Aria
            ariaProps: {
              role: "status",
              "aria-live": "polite",
            },
          }
        );
      });
  };

  return <button onClick={onSubmit}>Enviar correos</button>;
};

export default StartCampaignButton;
