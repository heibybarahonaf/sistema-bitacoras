import { NextResponse, NextRequest } from "next/server";
import { AuthEdgeUtils } from "./app/common/utils/auth-edge.utils";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;
    const calificacion_regex = /^\/api\/bitacoras\/[^/]+\/calificacion$/;

    const securityHeaders = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    const rutasPublicas = ["/login"];
    const esRutaPublica = rutasPublicas.includes(pathname) || pathname.startsWith("/firma/") || pathname.startsWith("/bitacoras/");

    const rutasApiPublicas = [
        "/api/auth/login",
        "/api/auth/enviar-codigo",
        "/api/firmas/finalizar",
        "/api/bitacoras/por-firma",
        "/api/encuesta",
        "/api/usuarios/nombre"
    ];
    
    const esPostPublico = 
        (pathname === "/api/firmas/finalizar" && method === "POST") ||
        (calificacion_regex.test(pathname) && method === "PATCH");

    const esApiPublica = 
        rutasApiPublicas.some(ruta => pathname.startsWith(ruta)) ||
        pathname.startsWith("/api/firmas/validar/") ||
        calificacion_regex.test(pathname) ||
        esPostPublico; 

    const esEncuestaIndividual = /^\/encuesta\/\d+$/.test(pathname);
    if (esRutaPublica || esApiPublica || esEncuestaIndividual) {
        const response = NextResponse.next();

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    }
    
    try {
        const token = req.cookies.get('session_token')?.value;
        if (!token) throw new Error("Sin token");

        const payload = await AuthEdgeUtils.verificarTokenSesion(token);

        const rutasSoloAdmin = ["/configuracion", "/encuestas", "/usuarios", "/sistemas", "/equipos"];
        for (const ruta of rutasSoloAdmin) {
            if (pathname.startsWith(ruta) && payload.rol !== "admin") {
                const url = new URL("/", req.url);
                url.searchParams.set("error", "acceso-denegado");
                return NextResponse.redirect(url);
            }
        }

        const response = NextResponse.next();

        const tiempoActual = Math.floor(Date.now() / 1000);
        const tiempoRestante = (payload.exp ?? 0) - tiempoActual;
        if (tiempoRestante > 0 && tiempoRestante <= 600) {
            response.headers.set("x-tiempo-restante", tiempoRestante.toString());
        }

        return response;

    } catch {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

}


export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
    ],
};
