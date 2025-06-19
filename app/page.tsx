import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-24 px-4">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mb-6">
        <Image
          src="/logo-PosdeHonduras.png"
          alt="POS de Honduras Logo"
          width={500}
          height={200}
          className="w-full h-auto transition-transform duration-500 hover:scale-105 drop-shadow-xl"
        />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700 text-center">
        Bienvenido al Sistema de Bitácoras de POS de Honduras
      </h1>
    </div>
  );
}




