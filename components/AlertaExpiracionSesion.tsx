"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

export default function AlertaExpiracionSesion() {
    
  useEffect(() => {

    fetch(window.location.href, { method: "HEAD" })
      .then((res) => {

        const tiempoRestante = parseInt(res.headers.get("x-tiempo-restante") || "0");

        if (tiempoRestante > 0 && tiempoRestante <= 600) {
          const minutos = Math.floor(tiempoRestante / 60);
          const segundos = tiempoRestante % 60;

          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 7000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: "warning",
            title: `Tu sesión expirará en ${minutos} minutos y ${segundos} segundos.`,
          });
        }
      });

  }, []);

  return null;

}
