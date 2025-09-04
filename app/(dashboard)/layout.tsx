import "../globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import AlertaExpiracionSesion from "@/components/AlertaExpiracionSesion";

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
      <AlertaExpiracionSesion />

      <Navbar />
      <main className="flex-1 p-4 pt-20">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white text-center py-4 shadow-inner">
        © {new Date().getFullYear()} POS de Honduras.
      </footer>
    </>
  );
}
