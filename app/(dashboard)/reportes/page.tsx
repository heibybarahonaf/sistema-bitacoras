"use client";

import Swal from "sweetalert2";
import { useState } from "react";
import { BarChart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import CardReporte from "../../../components/CardReporte";

interface BitacoraData {
  id: number;
  fecha: string;
  ticket: string;
  cliente: string;
  tecnico: string;
  hora_llegada: string;
  hora_salida: string;
  horas: string;
  servicio: string;
  modalidad: string;
  tipo_horas: string;
  monto: string;
  comision: string;
  descripcion: string;
  venta: string; 
}

export default function ReportesPage() {
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState({
    general: false,
    cliente: false,
    usuario: false,
    ventas: false
  });

  const [modalPreview, setModalPreview] = useState({
    isOpen: false,
    tipo: "" as "general" | "cliente" | "usuario" | "ventas",
    data: [] as BitacoraData[],
    loading: false,
    fechaInicio: "",
    fechaFinal: "",
    filtroNombre: "",
    rtnCliente: "",
    nombreCliente: ""
  });

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const formatearHora = (hora: string) => {
    if (!hora) return "";
    const d = new Date(hora);
    const horas = d.getHours().toString().padStart(2, "0");
    const minutos = d.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  };

  const mostrarAlertaError = (mensaje: string) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje,
      confirmButtonColor: "#dc2626"
    });
  };

  const mostrarAlertaExito = (mensaje: string) => {
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: mensaje,
      confirmButtonColor: "#16a34a",
      timer: 3000,
      showConfirmButton: false
    });
  };

  const mostrarAlertaAdvertencia = (mensaje: string) => {
    Swal.fire({
      icon: "warning",
      title: "Advertencia",
      text: mensaje,
      confirmButtonColor: "#16a34a",
      timer: 3000,
      showConfirmButton: false
    });
  };

  const generarReporte = async (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    nombre?: string,
    rtn?: string,
    usuario?: string
  ) => {
    if (!fechaInicio || !fechaFinal) {
      mostrarAlertaError("Ingresa ambas fechas");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      mostrarAlertaError("La fecha de inicio no puede ser mayor que la fecha final");
      return;
    }

    if (tipo == "usuario" && !nombre) {
      mostrarAlertaError(`Selecciona el Nombre del técnico`);
      return;
    }

    if (tipo == "ventas" && !usuario) {
      mostrarAlertaError(`Selecciona el Nombre del técnico`);
      return;
    }

    if (tipo == "cliente" && !rtn) {
      mostrarAlertaError(`Ingresa el RTN del Cliente`);
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [tipo]: true }));

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFinal
      });

      if (tipo == "usuario" && nombre) {
        params.append("nombre", nombre);
      } else if (tipo == "cliente" && rtn) {
        params.append("RTN", rtn);
      } else if(tipo == "ventas" && usuario){
        params.append("usuario", usuario);
      }

      const response = await fetch(`/api/reportes/${tipo}-bitacoras?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/pdf"
        }
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/pdf")) {
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

        mostrarAlertaAdvertencia(errorData.message || "Error al generar el reporte");
      }

    } catch {
      mostrarAlertaError("Error de conexión al generar el reporte");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const previsualizarReporte = async (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    id?: string,
    rtn?: string,
    usuario?: string
  ) => {
    if (!fechaInicio || !fechaFinal) {
      mostrarAlertaError("Ingresa las fechas para ver la vista previa");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      mostrarAlertaError("La fecha de inicio no puede ser mayor que la fecha final");
      return;
    }

    if (tipo === "cliente" && !rtn) {
      mostrarAlertaError("RTN requerido para vista previa por cliente");
      return;
    }

    if (tipo === "usuario" && !id) {
      mostrarAlertaError("Nombre requerido para vista previa por técnico");
      return;
    }

    if (tipo === "ventas" && !usuario) {
      mostrarAlertaError("Nombre requerido para vista previa por técnico");
      return;
    }

    setModalPreview({
      isOpen: true,
      tipo,
      data: [],
      loading: true,
      fechaInicio,
      fechaFinal,
      filtroNombre: tipo === "cliente" ? `Cliente RTN: ${rtn}` : tipo === "usuario" ? `Técnico: ${id}` : tipo === "ventas" ? `Técnico: ${usuario}` : "Reporte General",
      rtnCliente: tipo === "cliente" ? rtn || "" : "",
      nombreCliente: ""
    });

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFinal
      });

      if (tipo === "usuario" && id) {
        params.append("nombre", id);
      } else if (tipo === "cliente" && rtn) {
        params.append("RTN", rtn);
      } else if (tipo === "ventas" && usuario){
        params.append("usuario", usuario)
      }

      const response = await fetch(`/api/reportes/${tipo}-bitacoras/previsualizacion?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {

        const result = await response.json();
        const data = result.results?.[0] || [];
        setModalPreview(prev => ({
          ...prev,
          loading: false,
          data: data,
          nombreCliente: data.length > 0 ? data[0].cliente : ""
        }));

      } else {

        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: "Error interno del servidor" };
        }

        mostrarAlertaAdvertencia(errorData.message || "Error al cargar la vista previa");
        setModalPreview(prev => ({ ...prev, isOpen: false, loading: false }));
      }

    } catch (error) {

      mostrarAlertaError("Error de conexión al cargar la vista previa");
      setModalPreview(prev => ({ ...prev, isOpen: false, loading: false }));

    }

  };

  const cerrarModal = () => {
    setModalPreview({
      isOpen: false,
      tipo: "general",
      data: [],
      loading: false,
      fechaInicio: "",
      fechaFinal: "",
      filtroNombre: "",
      rtnCliente: "",
      nombreCliente: ""
    });
  };

  const reportes = [
    { tipo: "general" as const, title: "Reporte General" },
    { tipo: "cliente" as const, title: "Reporte por Cliente" },
    { tipo: "usuario" as const, title: "Reporte Comisiones" },
    { tipo: "ventas" as const, title: "Reporte Ventas" }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <BarChart className="w-8 h-8 text-[#295d0c]" />
        Gestión de Reportes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {reportes.map(({ tipo, title }) => (
          <CardReporte
            key={tipo}
            tipo={tipo}
            title={title}
            isGenerating={isGenerating[tipo]}
            onGenerate={generarReporte}
            onPreview={previsualizarReporte}
          />
        ))}
      </div>

      {modalPreview.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Vista Previa del Reporte</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {modalPreview.tipo === "cliente"
                    ? `RTN: ${modalPreview.rtnCliente} - Cliente: ${modalPreview.nombreCliente}`
                    : modalPreview.tipo === "usuario"
                      ? `Técnico: ${modalPreview.filtroNombre.split('Técnico: ')[1] || modalPreview.filtroNombre}`
                      : modalPreview.tipo === "ventas"
                        ? `Técnico: ${modalPreview.filtroNombre.split('Técnico: ')[1] || modalPreview.filtroNombre}`
                        : "Reporte General"
                  } • {formatearFecha(modalPreview.fechaInicio)} al {formatearFecha(modalPreview.fechaFinal)}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-170px)]">
              {modalPreview.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando vista previa...</span>
                </div>
              ) : modalPreview.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron bitácoras para el rango de fechas especificado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {modalPreview.tipo === "ventas" ? (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Bitacora</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Cliente</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                            {modalPreview.tipo === "general" && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Llegada</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Horas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">Descripción</th>
                              </>
                            )}
                            {modalPreview.tipo === "cliente" && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Horas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">Descripción</th>
                              </>
                            )}
                            {modalPreview.tipo === "usuario" && (
                              <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Bitacora #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tipo Horas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Monto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                              </>
                            )}

                            
                            
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalPreview.data.map((bitacora, index) => {
                        if (modalPreview.tipo === "ventas") {
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearFecha(bitacora.fecha)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.id}</td>
                              <td className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate" title={bitacora.cliente}>{bitacora.cliente}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.venta}</td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearFecha(bitacora.fecha)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.ticket}</td>
                            {modalPreview.tipo === "general" && (
                              <>
                                <td className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate" title={bitacora.cliente}>{bitacora.cliente}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.tecnico}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearHora(bitacora.hora_llegada)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearHora(bitacora.hora_salida)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.tipo_horas}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.servicio}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.modalidad}</td>                           
                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-pre-line max-w-80 break-words">{bitacora.descripcion}</td>
                              </>
                            )}
                            {modalPreview.tipo === "cliente" && (
                              <>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.tecnico}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearHora(bitacora.horas)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.tipo_horas}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.servicio}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.modalidad}</td>
                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-pre-line max-w-80 break-words">{bitacora.descripcion}</td>
                              </>
                            )}
                            {modalPreview.tipo === "usuario" && (
                              <>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.id}</td>
                                <td className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate" title={bitacora.cliente}>{bitacora.cliente}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatearHora(bitacora.horas)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.tipo_horas}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.monto}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{bitacora.comision}</td>
                              </>
                            )}

                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!modalPreview.loading && modalPreview.data.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 gap-2 text-sm text-gray-600">
              <p>Total de registros: {modalPreview.data.length}</p>

              {modalPreview.tipo === "usuario" && (() => {
                const totalMontos = modalPreview.data.reduce((sum, item) => sum + parseFloat(item.monto || "0"), 0);
                const totalComisiones = modalPreview.data.reduce((sum, item) => sum + parseFloat(item.comision || "0"), 0);

                return (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <span className="font-medium">Total Monto: </span> L. {totalMontos.toFixed(2)}
                    <span className="font-medium">Total Comisión: </span> L. {totalComisiones.toFixed(2)}
                  </div>
                );
              })()}

              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}