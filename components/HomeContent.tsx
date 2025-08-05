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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(
                circle at center,
                rgba(220, 220, 220, 0.4) 0%,
                rgba(220, 220, 220, 0.3) 30%,
                rgba(220, 220, 220, 0.2) 50%,
                rgba(220, 220, 220, 0.1) 70%,
                transparent 100%
              ),
              repeating-linear-gradient(
                45deg,
                rgba(180, 180, 180, 0.15),
                rgba(180, 180, 180, 0.15) 1px,
                transparent 1px,
                transparent 10px
              )
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 pb-0 shadow-2xl border border-white/20 max-w-2xl w-full mx-auto relative overflow-hidden">          <div className="absolute bottom-[-20px] left-0 w-full overflow-hidden leading-[0] z-0">
            <svg
              className="relative block w-[calc(150%+1.3px)] h-[200px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9F1C2C" />
                  <stop offset="100%" stopColor="#4D152C" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 C200,10 400,60 600,20 C800,0 1000,50 1200,15 L1200,120 L0,120 Z"
                fill="url(#waveGradient)"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mb-8 mx-auto">
              <Image
                src="/logo-PosdeHonduras.png"
                alt="POS de Honduras Logo"
                width={500}
                height={200}
                priority
                className="w-full h-auto transition-all duration-700 hover:scale-105 hover:brightness-110 drop-shadow-2xl"
              />
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-700 via-red-600 to-red-800 bg-clip-text text-transparent leading-tight">
                Sistema de Bitácoras Técnicas
              </h1>
              
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Soporte Técnico Especializado</p>
              </div>
              
              <div className="mt-8 flex items-center justify-center">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-full max-w-xs"></div>
              </div>
            </div>

            <div className="relative z-20 mt-12 mb-4">
              <p className="text-white text-sm md:text-base max-w-md mx-auto leading-relaxed text-center font-medium drop-shadow-lg">
                Bienvenido a nuestra plataforma integral para el registro, seguimiento y gestión de incidencias técnicas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}