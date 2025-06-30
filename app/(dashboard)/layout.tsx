import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
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

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 p-4 pt-20">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-red-700 text-white text-center py-4">
        © {new Date().getFullYear()} POS de Honduras.
      </footer>
    </>
  );
}