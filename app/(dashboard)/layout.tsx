import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/NavBar";

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