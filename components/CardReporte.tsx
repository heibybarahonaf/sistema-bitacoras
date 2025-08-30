import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { FileText, Download, Eye } from "lucide-react";

interface CardReporteProps {
  title: string;
  tipo: "general" | "cliente" | "usuario" | "ventas";
  isGenerating: boolean;
  onGenerate: (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    id?: string,
    rtn?: string,
    usuario?: string,
    estadoBitacora?: "firmadas" | "pendientes"
  ) => void;
  onPreview: (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    id?: string,
    rtn?: string,
    usuario?: string,
    estadoBitacora?: "firmadas" | "pendientes"
  ) => void;
  showTodosOption?: boolean; 
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}

export default function CardReporte({
  title,
  tipo,
  isGenerating,
  onGenerate,
  onPreview,
  showTodosOption = false, 
}: CardReporteProps) {
  const [entidadId, setEntidadId] = useState(showTodosOption ? "Todos" : "");
  const [fechaFinal, setFechaFinal] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [estadoBitacora, setEstadoBitacora] = useState<"firmadas" | "pendientes">("firmadas");

  useEffect(() => {
    if (tipo === "usuario" || tipo === "ventas") {
      cargarUsuariosActivos();
    }
  }, [tipo]);

  const cargarUsuariosActivos = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await fetch('/api/usuarios/activos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.results || []);
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error al cargar usuarios activos",
        });
        setUsuarios([]);
      }
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error de conexión al cargar usuarios",
      });
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleGenerate = () => {
    const usuarioId = tipo === "usuario" || tipo === "ventas" ? 
    (entidadId === "Todos" ? "Todos" : entidadId) : undefined;
  
    const rtnCliente = tipo === "cliente" ? entidadId : undefined;
    
    onGenerate(
      tipo,
      fechaInicio,
      fechaFinal,
      usuarioId,
      rtnCliente,
      usuarioId,
      tipo === "usuario" ? estadoBitacora : undefined
    );
  };

  const handlePreview = () => {
    const usuarioId = tipo === "usuario" || tipo === "ventas" ? 
    (entidadId === "Todos" ? "Todos" : entidadId) : undefined;
  
    const rtnCliente = tipo === "cliente" ? entidadId : undefined;
    
    onPreview(
      tipo,
      fechaInicio,
      fechaFinal,
      usuarioId,
      rtnCliente,
      usuarioId,
      tipo === "usuario" ? estadoBitacora : undefined
    );
  };

  const getIdLabel = () => {
    switch (tipo) {
      case "usuario":
        return "Técnico";
      case "ventas":
        return "Técnico";
      default:
        return "";
    }
  };

  const getIdPlaceholder = () => {
    switch (tipo) {
      case "usuario":
        return "Seleccione un técnico";
      case "ventas":
        return "Seleccione un técnico";
      default:
        return "";
    }
  };

  const renderEntidadInput = () => {
    if (tipo === "usuario" || tipo === "ventas") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getIdLabel()}
            </label>
            <select
              value={entidadId}
              onChange={(e) => setEntidadId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={isGenerating || loadingUsuarios}
            >
              <option value="">{loadingUsuarios ? "Cargando..." : getIdPlaceholder()}</option>
              {showTodosOption && <option value="Todos">Todos los técnicos</option>}
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.nombre}>
                  {usuario.nombre} {usuario.apellido}
                </option>
              ))}
            </select>
            {loadingUsuarios && (
              <p className="text-xs text-gray-500 mt-1">Cargando...</p>
            )}
            {!loadingUsuarios && usuarios.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No se encontraron técnicos activos</p>
            )}
          </div>

          {tipo === "usuario" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de las bitácoras
              </label>
              <select
                value={estadoBitacora}
                onChange={(e) => setEstadoBitacora(e.target.value as "firmadas" | "pendientes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isGenerating}
              >
                <option value="firmadas">Firmadas</option>
                <option value="pendientes">Pendientes</option>
              </select>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white text-sm rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
              <input
                type="date"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
            </div>
          </div>

          {(tipo === "usuario" || tipo === "ventas") && renderEntidadInput()}
        </div>

      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#5768b8] hover:bg-[#43529a] active:bg-[#1e2340]"
          } text-white`}
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Generando..." : "Generar PDF"}
        </button>

        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          } text-white`}
        >
          <Eye className="w-4 h-4" />
          Vista previa
        </button>
      </div>
    </div>
  );
}