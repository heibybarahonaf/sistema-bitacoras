
import { NextResponse, NextRequest } from "next/server";
import { AuthEdgeUtils } from "./app/common/utils/auth-edge.utils";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;    
    const esEncuestaIndividual = /^\/encuesta\/\d+$/.test(pathname);

    const rutasPublicas = ["/login"];
    const esRutaPublica = rutasPublicas.includes(pathname) || pathname.startsWith("/firma/") || pathname.startsWith("/bitacoras/");

    const rutasApiPublicas = [
        "/api/auth/login",
        "/api/auth/enviar-codigo",
        "/api/firmas/finalizar",
        "/api/encuesta-bitacora",
        "/api/bitacoras/por-firma",
        "/api/encuesta",
    ];
    
    const esApiPublica =
        rutasApiPublicas.some((ruta) => pathname.startsWith(ruta)) ||
        pathname.startsWith("/api/firmas/validar/")  ||
         /^\/api\/bitacoras\/\d+\/calificacion$/.test(pathname);

    if (esRutaPublica || esApiPublica || esEncuestaIndividual) {
        return NextResponse.next();
    }
    
    if (rutasPublicas.includes(pathname) || rutasApiPublicas.some(ruta => pathname.startsWith(ruta))) {
        return NextResponse.next();
    }
    
    try {
        const token = req.cookies.get('session_token')?.value;
        
        if (!token) {
            throw new Error("Sin token");
        }
        
        const payload = await AuthEdgeUtils.verificarTokenSesion(token);
        const rutasSoloAdmin = ["/configuracion", "/encuestas"];

        for (const ruta of rutasSoloAdmin) {

            if (pathname.startsWith(ruta) && payload.rol !== "admin") {
                const url = new URL("/", req.url);
                url.searchParams.set("error", "acceso-denegado");
                return NextResponse.redirect(url);
            }

        }
        
        return NextResponse.next();

    } catch {

        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);

    }

}


export const config = {

    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
    ],

};
