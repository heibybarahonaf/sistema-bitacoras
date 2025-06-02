import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-24">
      <Image
        src="/logo-PosdeHonduras.png"
        alt="POS de Honduras Logo"
        width={500}
        height={200}
        className="mb-6 transition-transform duration-500 hover:scale-105 drop-shadow-xl"
      />
      <h1 className="text-3xl font-bold text-red-700 text-center">
        Bienvenido al Sistema de Bitácoras de POS de Honduras
      </h1>
    </div>
  );
}



