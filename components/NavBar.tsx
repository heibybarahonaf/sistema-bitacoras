"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  User, Users, NotebookText, BarChart, LogOut,
  ClipboardList, Settings, Cpu, HardDrive, Receipt, MonitorDot
} from "lucide-react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = "@Usuario";
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { href: "/usuarios", label: "Usuarios", icon: User },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/bitacoras", label: "Bitácoras", icon: NotebookText },
    { href: "/sistemas", label: "Sistemas", icon: HardDrive },
    { href: "/equipos", label: "Equipos", icon: MonitorDot },
    { href: "/pagos", label: "Pagos", icon: Receipt },
    { href: "/reportes", label: "Reportes", icon: BarChart },
    { href: "/encuestas", label: "Encuestas", icon: ClipboardList },
    { href: "/configuracion", label: "Configuración", icon: Settings }
  ];

  return (
    <>
      {/* Barra superior */}
      <nav className="bg-red-700 text-white px-6 py-4 flex justify-between items-center shadow fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            className="text-white text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)} // ← toggle abierto/cerrado
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

      {/* Overlay oscuro (cierra al hacer clic fuera) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Menú lateral debajo del navbar */}
      <aside
        className={`bg-black text-white w-64 fixed top-16 bottom-0 left-0 p-6 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-4 mt-16 flex flex-col h-[calc(100%-8rem)] justify-center">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)} // ← se cierra al navegar
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-red-700 text-white border-l-4 border-red-500 shadow-md"
                      : "hover:bg-gray-800 hover:text-red-400"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? "text-red-200" : ""}`} />
                  <span className={`font-medium text-base truncate ${active ? "text-white" : ""}`}>
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
    </>
  );
}
