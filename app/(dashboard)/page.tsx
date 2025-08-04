import { Suspense } from "react";
import Home from "@/components/HomeContent"; 
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner mensaje="Cargando..." />}>
            <Home />
        </Suspense>
    );
}
