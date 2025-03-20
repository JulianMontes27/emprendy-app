"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";

interface Contact {
  email: string;
  name?: string;
}

interface Campaign {
  id: string;
  name: string;
}

interface Template {
  name: string;
  subject: string | null;
  content: string | null;
}

interface StartCampaignButtonProps {
  campaign: Campaign;
  template: Template | null;
  contacts: Contact[];
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StartCampaignButton: React.FC<StartCampaignButtonProps> = ({
  campaign,
  template,
  contacts,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);

  const handleCampaignStart = async () => {
    if (contacts.length === 0) {
      toast.error("No hay contactos para enviar emails", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setTotalEmails(contacts.length);
    setProgress(0);

    try {
      // For demonstration purposes - using test email
      // In production, you might want to send to all contacts
      // Either in batches or via a backend job

      const response = await axios.post("/api/send_email/gmail", {
        to: "julianmontesps4@gmail.com",
        subject: template?.subject || "Campaign: " + campaign.name,
        body: template?.content || "Contenido de la campaña",
      });

      if (response.data.success) {
        toast.success("Campaña iniciada exitosamente", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error sending campaign emails:", error);
      toast.error("Error al iniciar la campaña. Inténtalo de nuevo.", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Style variants
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    outline:
      "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-400",
  };

  // Size variants
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleCampaignStart}
      disabled={isLoading}
      className={`
        relative flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variants[variant]}
        ${sizes[size]}
        ${isLoading ? "opacity-80 cursor-not-allowed" : ""}
        ${className}
      `}
      aria-label="Iniciar campaña"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Procesando...</span>
          {progress > 0 && totalEmails > 0 && (
            <span className="text-xs ml-1">
              ({Math.round((progress / totalEmails) * 100)}%)
            </span>
          )}
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          <span>Iniciar campaña</span>
        </>
      )}

      {/* Animated progress indicator */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg overflow-hidden w-full">
          <div
            className="h-full bg-white/80 transition-all duration-300 ease-out"
            style={{
              width: `${progress > 0 ? (progress / totalEmails) * 100 : 100}%`,
            }}
          ></div>
        </div>
      )}
    </button>
  );
};

export default StartCampaignButton;
