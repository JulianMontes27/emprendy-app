import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  process.env.NEXTAUTH_URL + "/api/auth/callback/google" // Use environment variable for callback URL
);
