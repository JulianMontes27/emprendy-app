import * as React from "react";

interface EmailTemplateProps {
  // firstName: string;
  subject: string;
  body: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  // firstName,
  subject,
  body,
}) => (
  <div style={styles.container}>
    {/* Header */}
    <div style={styles.header}>
      <h1 style={styles.title}>{subject}</h1>
    </div>

    {/* Greeting */}
    <div style={styles.content}>
      {/* <p style={styles.greeting}>Hello, {firstName}!</p> */}

      {/* Email Body */}
      <div style={styles.body} dangerouslySetInnerHTML={{ __html: body }} />

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Thank you for choosing our service. If you have any questions, feel
          free to reply to this email.
        </p>
        <p style={styles.footerText}>
          Best regards,
          <br />
          The Team
        </p>
      </div>
    </div>
  </div>
);

// Styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    backgroundColor: "#4a90e2",
    color: "#ffffff",
    padding: "20px",
    borderRadius: "8px 8px 0 0",
    textAlign: "center" as const,
  },
  title: {
    margin: "0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "0 0 8px 8px",
  },
  greeting: {
    fontSize: "18px",
    color: "#333333",
    margin: "0 0 20px 0",
  },
  body: {
    fontSize: "16px",
    color: "#555555",
    lineHeight: "1.6",
  },
  footer: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #eeeeee",
  },
  footerText: {
    fontSize: "14px",
    color: "#777777",
    margin: "0 0 10px 0",
  },
};
