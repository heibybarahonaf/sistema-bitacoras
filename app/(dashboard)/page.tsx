import { Suspense } from "react";
import Home from "@/components/HomeContent"; 

export default function Page() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Home />
        </Suspense>
    );
}
