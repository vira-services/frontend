import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { allFonts, satoshi } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Vira",
  description: "a biolink that is free, safe, fast, and in your reach.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#0b0b0e",
};

const fontVariables = allFonts.map((f) => f.variable).join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariables} ${satoshi.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
