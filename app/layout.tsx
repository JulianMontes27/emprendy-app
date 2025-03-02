import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/providers/socket-provider";
import ReactQueryProvider from "@/providers/query-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Emprendy",
  description:
    "To empower individuals and small businesses in Latin America by democratizing access to digital tools that drive financial inclusion, economic growth, and innovation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <ModalProvider />
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </SocketProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
