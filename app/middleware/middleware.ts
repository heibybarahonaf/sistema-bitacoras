import { NextResponse, NextRequest } from "next/server";
import { obtenerPayloadSesion } from "../common/utils/session.utils";
import { GeneralUtils } from "../common/utils/general.utils";

export async function middleware(req: NextRequest) {

    try {

        await obtenerPayloadSesion();
        return NextResponse.next();

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
