export const runtime = 'nodejs'; 

import { NextRequest, NextResponse } from 'next/server';
import { obtenerPayloadSesion } from '@/app/common/utils/session.utils';
import { GeneralUtils } from '@/app/common/utils/general.utils';

export async function GET(req: NextRequest) {

    try {

        const payload = await obtenerPayloadSesion();
        return NextResponse.json({ success: true, payload});

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}