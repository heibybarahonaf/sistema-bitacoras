"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Users, NotebookText, BarChart, LogOut, ClipboardList } from "lucide-react";


export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = "@Usuario"; // Esto será dinámico luego

  return (
    <>
      <nav className="bg-red-700 text-white px-6 py-4 flex justify-between items-center shadow fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            className="text-white text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <Link href="/">
            <Image src="/logo-white.png" alt="Logo POS" width={40} height={40} className="cursor-pointer" />
          </Link>
          <span className="text-lg font-semibold hidden sm:block">SISTEMA DE BITÁCORAS</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm hidden sm:inline">{userName}</span>
        </div>
      </nav>

      {/* Menú lateral desplegable negro */}
      <aside
        className={`bg-black text-white w-64 h-full fixed top-0 left-0 p-6 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="text-white text-lg mb-4"
          onClick={() => setSidebarOpen(false)}
        >
          ✖ Cerrar
        </button>

        <ul className="space-y-15 mt-4">
            <li>
                <Link href="/usuarios" className="flex items-center gap-2 hover:underline">
                    <User className="w-5 h-5" /> Usuarios
                </Link>
            </li>
            <li>
                <Link href="/clientes" className="flex items-center gap-2 hover:underline">
                    <Users className="w-5 h-5" /> Clientes
                </Link>
            </li>
            <li>
                <Link href="/bitacoras" className="flex items-center gap-2 hover:underline">
                    <NotebookText className="w-5 h-5" /> Bitácoras
                </Link>
            </li>
            <li>
                <Link href="/reportes" className="flex items-center gap-2 hover:underline">
                    <BarChart className="w-5 h-5" /> Reportes
                </Link>
            </li>
            <li>
                <Link href="/encuesta" className="flex items-center gap-2 hover:underline">
                    <ClipboardList className="w-5 h-5" /> Encuestas
                </Link>
            </li>
        </ul>


        <div className="absolute bottom-4 right-4">
          <button className="flex items-center gap-2 text-sm hover:text-red-500">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </aside>
    </>
  );
}

