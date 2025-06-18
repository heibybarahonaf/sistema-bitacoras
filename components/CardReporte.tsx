import { useState } from "react";
import { FileText, Download } from "lucide-react";

interface CardReporteProps {
  title: string;
  tipo: "general" | "cliente" | "usuario";
  isGenerating: boolean;
  onGenerate: (tipo: "general" | "cliente" | "usuario", fechaInicio: string, fechaFinal: string, id?: string) => void;
}

export default function CardReporte({ title, tipo, isGenerating, onGenerate }: CardReporteProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [entidadId, setEntidadId] = useState("");

  const handleGenerate = () => {
    onGenerate(tipo, fechaInicio, fechaFinal, tipo !== "general" ? entidadId : undefined);
  };

  const getIdLabel = () => {
    switch (tipo) {
      case "cliente": return "ID Cliente";
      case "usuario": return "ID Tecnico";
      default: return "";
    }
  };

  const getIdPlaceholder = () => {
    switch (tipo) {
      case "cliente": return "Ingresa el ID del cliente";
      case "usuario": return "Ingresa el ID del Tecnico";
      default: return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Final
          </label>
          <input
            type="date"
            value={fechaFinal}
            onChange={(e) => setFechaFinal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
        </div>

        {tipo !== "general" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getIdLabel()}
            </label>
            <input
              type="text"
              value={entidadId}
              onChange={(e) => setEntidadId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              placeholder={getIdPlaceholder()}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
          isGenerating 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-[#5768b8] hover:bg-[#43529a] active:bg-[#1e2340]"
        } text-white`}
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isGenerating ? "Descargando..." : "Descargar"}
      </button>
    </div>
  );

}
