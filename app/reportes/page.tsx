// app/reportes/page.tsx
export default function ReportesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 p-6 pt-20">Reportes</h1>
      <p className="text-gray-600">Consulta de reportes por cliente o usuario.</p>

      <div className="mt-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>Historial por técnico</li>
          <li>Historial por cliente</li>
          <li>Exportación a PDF</li>
        </ul>
      </div>
    </div>
  );
}
