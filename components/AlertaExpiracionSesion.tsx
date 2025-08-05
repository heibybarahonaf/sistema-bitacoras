"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

let alertaMostrada = false;

export default function AlertaExpiracionSesion() {
  
  const mostrarAlerta = (tiempoRestante: number) => {
    
    if (alertaMostrada) {
      return;
    }
    
    alertaMostrada = true;
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    
    Swal.fire({
      icon: "warning",
      title: "Sesión por expirar",
      html: `Tu sesión expirará en <strong>${minutos} minutos</strong> y <strong>${segundos} segundos</strong>.`,
      showCancelButton: true,
      confirmButtonText: "Renovar sesión",
      cancelButtonText: "Entendido",
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
    }).then(async (result) => {
      
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/auth/renovar-sesion", { method: "POST" });

          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Sesión renovada",
              timer: 2000,
              showConfirmButton: false,
            });

          } else {
            Swal.fire({
              icon: "error",
              title: "No se pudo renovar",
              text: "Inicia sesión nuevamente.",
            });
          }

        } catch {

          Swal.fire({
            icon: "error",
            title: "Error de red",
            text: "No se pudo contactar al servidor.",
          });

        }
      }

      setTimeout(() => {
        alertaMostrada = false;
      }, 300000); 
    });
    
  };

  
  useEffect(() => {
    const verificarInicial = async () => {
      const currentPath = window.location.pathname;
      const esRutaPublica = currentPath === '/login' || 
                           currentPath.startsWith('/firma/') || 
                           currentPath.startsWith('/bitacoras/') ||
                           /^\/encuesta\/\d+$/.test(currentPath);
      
      if (esRutaPublica) return;

      try {
        const res = await fetch(window.location.href, { 
          method: "HEAD", 
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (res.headers.has("x-tiempo-restante")) {
          const tiempoRestante = parseInt(res.headers.get("x-tiempo-restante") || "0");
          if (tiempoRestante > 0 && tiempoRestante <= 900) {
            mostrarAlerta(tiempoRestante);
          }
        }

      } catch {
        // error verificación inicial
      }
    };

    verificarInicial();

    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args)
        .then(response => {
          if (response.ok && response.headers.has("x-tiempo-restante")) {
            const tiempoRestante = parseInt(response.headers.get("x-tiempo-restante") || "0");
            if (tiempoRestante > 0 && tiempoRestante <= 900) {
              mostrarAlerta(tiempoRestante);
            }
          }
          return response;
        })
        .catch(error => {
          throw error;
        });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}