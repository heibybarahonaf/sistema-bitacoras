const LoadingSpinner = ({ mensaje = "Cargando..." }: { mensaje?: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-14 h-14 border-[4px] border-emerald-500 border-t-transparent rounded-full animate-spin transition-all duration-300"></div>
    <p className="mt-6 text-gray-700 font-semibold text-base animate-pulse">
      {mensaje}
    </p>
  </div>
);

export default LoadingSpinner;