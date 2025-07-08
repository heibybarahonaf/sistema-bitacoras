"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  User, Users, NotebookText, BarChart, LogOut,
  ClipboardList, Settings, HardDrive, Receipt, MonitorDot
} from "lucide-react";
import Swal from "sweetalert2";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState("@");
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/bitacoras", label: "Bitácoras", icon: NotebookText },
    { href: "/pagos", label: "Pagos", icon: Receipt },
    { href: "/equipos", label: "Equipos", icon: MonitorDot },
    { href: "/sistemas", label: "Sistemas", icon: HardDrive },
    { href: "/usuarios", label: "Usuarios", icon: User },
    { href: "/reportes", label: "Reportes", icon: BarChart },
    { href: "/encuestas", label: "Encuesta", icon: ClipboardList },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];

  const obtenerUsuario = async () => {
    try {
      const res = await fetch("/api/auth/obtener-sesion", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserName("@" + data.results?.[0].nombre || "@usuario");
      }
    } catch (error) {
      console.error("Error al obtener nombre del usuario:", error);
    }
  };

  useEffect(() => {
    setTimeout(obtenerUsuario, 0);
  }, []);

  const confirmarLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente para ingresar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#999",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSidebarOpen(false);
        router.push("/login");
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Barra superior */}
      <nav className="bg-red-700 text-white px-6 py-4 flex justify-between items-center shadow fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            className="text-white text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <Link href="/">
            <Image
              src="/logo-white.png"
              alt="Logo POS"
              width={40}
              height={40}
              className="cursor-pointer"
            />
          </Link>
          <span className="text-lg font-semibold hidden sm:block">SISTEMA DE BITÁCORAS</span>
        </div>

        {/* Usuario y botón salir */}
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:inline">{userName}</span>
          <button
            onClick={confirmarLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-1 text-white transition ${
              isLoggingOut ? "opacity-50 cursor-not-allowed" : "hover:text-gray-300"
            }`}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoggingOut ? "Saliendo..." : "Salir"}</span>
          </button>
        </div>
      </nav>

      {/* Overlay oscuro */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Menú lateral */}
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
                  onClick={() => setSidebarOpen(false)}
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

        {/* Botón salir en el menú lateral */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={confirmarLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              isLoggingOut ? "text-gray-400 cursor-not-allowed" : "hover:text-red-500"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Saliendo..." : "Salir"}
          </button>
        </div>
      </aside>
    </>
  );
}
