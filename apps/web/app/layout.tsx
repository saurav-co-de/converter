import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@pdf-platform/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF to JPG | Simple PDF upload and download service",
  description: "Upload a PDF and download it as a JPG. No account required."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
