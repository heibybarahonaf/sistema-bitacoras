"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rutas que no deben mostrar el layout
const authRoutes = ['/login', '/register', '/forgot-password'];

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    return (
      <html lang="es">
        <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 p-4 pt-20">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 w-full bg-red-700 text-white text-center py-4">
          © 2025 POS de Honduras.
        </footer>
      </body>
    </html>
  );
}