import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { NavbarProvider } from "@/context/NavbarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATS Optimizer",
  description: "Optimize your resume for ATS and get more interviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <NavbarProvider>
          <main>
            <ConditionalNavbar />
            {children}
          </main>
        </NavbarProvider>
      </body>
    </html>
  );
}
