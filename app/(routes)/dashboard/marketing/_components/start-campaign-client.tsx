"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

interface StartCampaignButtonProps {
  campaign: any;
  template: any;
  contacts: any[];
}

const StartCampaignButton: React.FC<StartCampaignButtonProps> = ({
  campaign,
  template,
  contacts,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      // Send POST to the API server
      await axios.post("/api/send_email", {
        campaign,
        template,
        contacts,
      });

      // Show success toast
      toast.success(
        "Tu correo ha sido enviado. Pronto nos pondremos en contacto contigo.",
        {
          duration: 4000,
          position: "top-center",
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        }
      );
    } catch (error) {
      // Show error toast
      toast.error(
        "Hubo un error al enviar el correo. Por favor, inténtalo de nuevo.",
        {
          duration: 4000,
          position: "top-center",
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        }
      );
      console.error("Error sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onSubmit}
      disabled={isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
    >
      {isLoading ? "Enviando..." : "Enviar correos"}
    </button>
  );
};

export default StartCampaignButton;
