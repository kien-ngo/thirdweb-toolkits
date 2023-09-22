import Navbar from "@/components/Navbar";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "thirdweb Toolkits",
  description: "A set of small apps that compliment the thirdweb ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col h-[100vh]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
