"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Users, NotebookText, BarChart, LogOut, ClipboardList } from "lucide-react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = "@Usuario"; // Esto será dinámico luego
  const pathname = usePathname();


  const isActive = (path: string) => {
    return pathname === path;
  };


  const menuItems = [
    {
      href: "/usuarios",
      label: "Usuarios",
      icon: User
    },
    {
      href: "/clientes",
      label: "Clientes", 
      icon: Users
    },
    {
      href: "/bitacoras",
      label: "Bitácoras",
      icon: NotebookText
    },
    {
      href: "/reportes",
      label: "Reportes",
      icon: BarChart
    },
    {
      href: "/encuesta",
      label: "Encuestas",
      icon: ClipboardList
    }

  ];


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

        <ul className="space-y-4 mt-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active 
                      ? "bg-red-700 text-white border-l-4 border-red-500 shadow-md" 
                      : "hover:bg-gray-800 hover:text-red-400"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? "text-red-200" : ""}`} />
                  <span className={`font-medium ${active ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="absolute bottom-4 right-4">
          <button className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors duration-200">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}