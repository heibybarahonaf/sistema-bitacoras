export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { ResponseDto } from "@/app/common/dtos/response.dto";

export async function POST() {

    try{
        const response = NextResponse.json(new ResponseDto(200, "Sesión cerrada exitosamente"));

        response.cookies.set("session_token", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0), 
            path: "/",
            sameSite: "lax",
        });
        
        return response;

    }catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
    
}
