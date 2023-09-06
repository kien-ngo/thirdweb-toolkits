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
        <div className="w-full border-b p-2 flex flex-row justify-between text-2xl mb-8">
          <a href="/">Home</a>
          <div>
            <a href="https://github.com/kien-ngo/thirdweb-toolkits">Github</a>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
