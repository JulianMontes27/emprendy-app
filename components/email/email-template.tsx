import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  msg: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  msg,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
    }}
  >
    <h1 style={{ color: "#007bff", textAlign: "center" }}>
      Gracias por escribirnos, {name} 🎾
    </h1>

    <p style={{ fontSize: "16px", color: "#333" }}>
      Hemos recibido tu mensaje y nuestro equipo se pondrá en contacto contigo
      lo antes posible.
    </p>

    <div
      style={{
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
        marginTop: "20px",
      }}
    >
      <h3 style={{ color: "#444", marginBottom: "5px" }}>Tu mensaje:</h3>
      <p style={{ fontSize: "15px", color: "#555", whiteSpace: "pre-wrap" }}>
        "{msg}"
      </p>
    </div>

    <p style={{ fontSize: "16px", color: "#333", marginTop: "20px" }}>
      Si necesitas asistencia urgente, puedes responder a este correo o
      contactarnos en{" "}
      <a
        href="mailto:info@tennisclub.com"
        style={{ color: "#007bff", textDecoration: "none" }}
      >
        info@tennisclub.com
      </a>
      .
    </p>

    <footer
      style={{
        marginTop: "30px",
        textAlign: "center",
        fontSize: "14px",
        color: "#666",
      }}
    >
      🎾 <strong>Tennis Club</strong> | Tel: +57 123 456 7890 |{" "}
      <a
        href="https://tennisclub.com"
        style={{ color: "#007bff", textDecoration: "none" }}
      >
        Visita nuestra web
      </a>
    </footer>
  </div>
);
