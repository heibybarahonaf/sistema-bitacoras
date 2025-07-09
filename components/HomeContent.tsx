"use client";

import Image from "next/image";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "acceso-denegado") {
      Swal.fire({
        icon: "warning",
        title: "Acceso Denegado",
        text: "No tienes permisos para acceder a esta sección.",
        confirmButtonText: "Entendido",
      });
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    router.replace(url.pathname);
  }, [router, error]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-24 px-4">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mb-6">
        <Image
          src="/logo-PosdeHonduras.png"
          alt="POS de Honduras Logo"
          width={500}
          height={200}
          priority
          className="w-full h-auto transition-transform duration-500 hover:scale-105 drop-shadow-xl"
        />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700 text-center">
        BIENVENIDO AL SISTEMA DE BITÁCORAS TÉCNICAS
      </h1>
    </div>
  );
}
