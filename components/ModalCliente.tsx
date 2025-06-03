import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalCliente({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose} // cerrar modal al hacer clic afuera
      style={{ overflowY: "auto" }} // permite scroll si la pantalla es pequeña
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto shadow-lg"
        onClick={(e) => e.stopPropagation()} // evitar cerrar modal al clicar dentro
      >
        {children}
      </div>
    </div>
  );
}
