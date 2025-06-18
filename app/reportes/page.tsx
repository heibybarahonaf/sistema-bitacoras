"use client";

import { useState } from "react";
import { BarChart } from "lucide-react";
import Swal from "sweetalert2";
import CardReporte from "../../components/CardReporte"; 

export default function ReportesPage() {
  const [isGenerating, setIsGenerating] = useState({ 
    general: false, 
    cliente: false, 
    usuario: false 
  });

  const mostrarAlertaError = (mensaje: string) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonColor: '#dc2626'
    });
  };

  const mostrarAlertaExito = (mensaje: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: mensaje,
      confirmButtonColor: '#16a34a',
      timer: 3000,
      showConfirmButton: false
    });
  };

  const generarReporte = async (
    tipo: "general" | "cliente" | "usuario", 
    fechaInicio: string, 
    fechaFinal: string, 
    id?: string
  ) => {
    
    if (!fechaInicio || !fechaFinal) {
      mostrarAlertaError("Por favor ingresa ambas fechas");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      mostrarAlertaError("La fecha de inicio no puede ser mayor que la fecha final");
      return;
    }

    if (tipo !== "general" && (!id || !id.trim())) {
      const entidad = tipo === "cliente" ? "cliente" : "tecnico";

      mostrarAlertaError(`Por favor ingresa el ID del ${entidad}`);
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [tipo]: true }));

    try {
      const params = new URLSearchParams({ 
        fechaInicio, 
        fechaFinal 
      });
      
      if (tipo !== "general" && id) {
        params.append(tipo === "cliente" ? "clienteId" : "usuarioId", id);
      }

      const response = await fetch(`/api/reportes/${tipo}-bitacoras?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/pdf')) {
          mostrarAlertaError("El servidor no devolvió un PDF válido");
          return;
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          mostrarAlertaError("El PDF generado está vacío");
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bitacoras_${tipo}_${fechaInicio}_${fechaFinal}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        mostrarAlertaExito("PDF descargado exitosamente");

      } else {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: "Error interno del servidor" };
        }

        mostrarAlertaError(errorData.message || "Error al generar el reporte");

      }
    } catch (error) {
      mostrarAlertaError("Error de conexión al generar el reporte");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [tipo]: false }));
    }

  };

  const reportes = [
    { tipo: "general" as const, title: "Reporte General" },
    { tipo: "cliente" as const, title: "Reporte por Cliente" },
    { tipo: "usuario" as const, title: "Reporte por Tecnico" }
  ];


  return (
    <div className="p-6 pt-20">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <BarChart className="w-8 h-8 text-[#295d0c]" />
        Gestión de Reportes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportes.map(({ tipo, title }) => (
          <CardReporte
            key={tipo}
            tipo={tipo}
            title={title}
            isGenerating={isGenerating[tipo]}
            onGenerate={generarReporte}
          />
        ))}
      </div>
    </div>
  );

}
