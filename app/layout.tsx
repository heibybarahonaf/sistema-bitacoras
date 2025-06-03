import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitácoras POS",
  description: "Gestión y seguimiento de bitácoras técnicas para POS de Honduras",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 pt-20">
          {children}
        </main>
        <footer className="bg-red-700 text-white text-center py-3">
          © 2025 POS de Honduras.
        </footer>
      </body>
    </html>
  );
}




