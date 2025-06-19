// components/Sidebar.tsx

import { LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-60 min-w-[240px] h-screen bg-black text-white flex flex-col justify-between fixed left-0 top-0 z-50">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Menú</h2>
        <ul className="space-y-2">
          <li className="hover:bg-white hover:text-black p-2 rounded cursor-pointer">Inicio</li>
          <li className="hover:bg-white hover:text-black p-2 rounded cursor-pointer">Clientes</li>
          <li className="hover:bg-white hover:text-black p-2 rounded cursor-pointer">Bitácoras</li>
        </ul>
      </div>

      <div className="p-4">
        <button className="flex items-center gap-2 hover:text-red-400">
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </aside>
  );
}
