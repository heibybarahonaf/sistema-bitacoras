type Cliente = {
  empresa: string;
  responsable: string;
  correo: string;
  telefono: string;
  rtn: string;
  direccion: string;
  horas_paquetes: number;
  horas_individuales: number;
};

export function ClienteInfo({ cliente }: { cliente: Cliente | null }) {
  if (!cliente) {
    return <p className="text-gray-500">Selecciona un cliente para ver su información.</p>;
  }

  const totalHoras = (cliente.horas_paquetes || 0) + (cliente.horas_individuales || 0);

  return (
    <div className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="font-bold text-lg">Datos cliente</h2>
        <p><strong>Empresa:</strong> {cliente.empresa}</p>
        <p><strong>Responsable:</strong> {cliente.responsable}</p>
        <p><strong>Email:</strong> {cliente.correo}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>RTN:</strong> {cliente.rtn}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>
      </div>

      <div className="flex flex-col justify-between items-end">
        <div className="text-right">
          <h3 className="font-bold">Horas - Saldo</h3>
          <p>Paquete: {cliente.horas_paquetes}h</p>
          <p>Individual: {cliente.horas_individuales}h</p>
          <hr className="my-1" />
          <p><strong>Total: {totalHoras}h</strong></p>
        </div>
      </div>
    </div>
  );
}

