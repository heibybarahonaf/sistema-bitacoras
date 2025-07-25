import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ConfiguracionService } from "../services/configService";

const campo_vacio = "-";

export type BitacoraReporteGeneral = {
    id: number;
    fecha_servicio: Date;
    no_ticket: string | null;
    cliente_id: number;
    usuario_id: number;
    hora_llegada: Date;
    hora_salida: Date;
    modalidad: string | null;
    horas_consumidas: number | null;
    tipo_horas: string | null;
    descripcion_servicio: string | null;
    cliente?: { empresa: string } | null;
    usuario?: { nombre: string } | null;
    tipo_servicio?: { descripcion: string } | null;
};

export type BitacoraReporteComisiones = {
    id: number;
    fecha_servicio: Date;
    no_ticket: string | null;
    cliente_id: number;
    usuario_id: number;
    horas_consumidas: number | null;
    tipo_horas: string | null;
    cliente?: { empresa: string } | null;
    usuario?: { 
        nombre: string;
        comision: number | null;
        correo: string | null;
        telefono: string | null;
        zona_asignada: string | null;
    } | null;
};

export type BitacoraReporteVentas = {
    id: number;
    fecha_servicio: Date;
    cliente_id: number;
    usuario_id: number;
    ventas: string | null;
    cliente?: { empresa: string } | null;
    usuario?: { 
        nombre: string;
        correo: string | null;
        telefono: string | null;
        zona_asignada: string | null;
    } | null;
};

export type BitacoraReporteCliente = {
    fecha_servicio: Date;
    no_ticket: string | null;
    modalidad: string | null;
    horas_consumidas: number | null;
    tipo_horas: string | null;
    descripcion_servicio: string | null;
    usuario?: { nombre: string } | null;
    tipo_servicio?: { descripcion: string } | null;
    cliente?: {
        empresa: string;
        responsable: string | null;
        rtn: string | null;
        direccion: string | null;
        telefono: string | null;
        correo: string | null;
    } | null;
};

type DatosExtrasReporte = {
    tecnico?: string;
    cliente?: string;
    responsable?: string;
    rtn?: string;
    direccion?: string;
    telefono_cliente?: string;
    correoCliente?: string;
    correoUsuario?: string;
    telefono_usuario?: string;
    zona?: string;
};

function generarReporte(
    titulo: string,
    bitacoras: any[],
    fechaInicio: string,
    fechaFinal: string,
    columnas: string[],
    datos: (string | number | null)[][],
    valores_final?: { total?: string; comision?: string },
    nombresExtras?: DatosExtrasReporte
): jsPDF {
    const doc = new jsPDF('l', 'mm', 'a4');
    const logoPath = path.join(process.cwd(), "public", "logo-PosdeHonduras.png");
    const imageBuffer = fs.readFileSync(logoPath);
    const imageBase64 = imageBuffer.toString("base64");
    const imgData = `data:image/png;base64,${imageBase64}`;

    let currentY = 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 10, currentY);
    currentY += 7;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("POS de Honduras", 10, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Período: ${fechaInicio} hasta ${fechaFinal}`, 10, currentY);
    currentY += 6;

    if (nombresExtras?.tecnico) {
        currentY = renderInfoTecnico(doc, currentY, nombresExtras);
    }

    if (nombresExtras?.cliente) {
        currentY = renderInfoCliente(doc, currentY, nombresExtras);
    }

    doc.addImage(imgData, "PNG", 250, 9, 30, 15);

    autoTable(doc, {
        head: [columnas],
        body: datos,
        startY: currentY + 3,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [165, 42, 42] },
    });

    const pageHeight = doc.internal.pageSize.height;
    const espacioFooter = 18; 
    
    let finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5; 
    if (finalY + espacioFooter > pageHeight) {
        doc.addPage();
        finalY = 10;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Total registros: ${bitacoras.length}`, 10, finalY);

    if (valores_final?.total) {
        finalY += 6;
        doc.text(`Total monto: ${valores_final.total}`, 10, finalY);
    }

    if (valores_final?.comision) {
        finalY += 6;
        doc.text(`Comisión: ${valores_final.comision}`, 10, finalY);
    }

    return doc;

}


export function generarPDFBitacoras(bitacoras: BitacoraReporteGeneral[], fechaInicio: string, fechaFinal: string): Buffer {
    
    const columnas = [
        "Fecha","Ticket", "Cliente", "Técnico",  "Llegada", "Salida", "Servicio",
        "Modalidad", "Horas", "Tipo Horas", "Descripción"
    ];

    const datos = bitacoras.map(b => [
        formatearFecha(b.fecha_servicio.toISOString()),
        b.no_ticket || campo_vacio,
        b.cliente?.empresa || `ID: ${b.cliente_id}`,
        b.usuario?.nombre || `ID: ${b.usuario_id}`,
        formatearHora(b.hora_llegada.toISOString()),
        formatearHora(b.hora_salida.toISOString()),
        b.tipo_servicio?.descripcion || campo_vacio,
        b.modalidad || campo_vacio,
        b.horas_consumidas || campo_vacio,
        b.tipo_horas || campo_vacio,
        b.descripcion_servicio || campo_vacio,
    ]);

    const doc = generarReporte("Reporte de Bitácoras", bitacoras, fechaInicio, fechaFinal, columnas, datos);
    return Buffer.from(doc.output('arraybuffer'));

}


export async function generarPDFPorTecnico(bitacoras: BitacoraReporteComisiones[], fechaInicio: string, fechaFinal: string): Promise<Buffer> {
    
    const config = await ConfiguracionService.obtenerConfiguracionPorId(1);
    const precioIndividual = config.valor_hora_individual;
    const precioPaquete = config.valor_hora_paquete;
    let porcentajeComision = 0;

    const columnas = [
        "Fecha", "Bitacora No.", "Ticket", "Cliente", "Horas", "Tipo Horas", "% Comisión", "Monto", "Comisión", 
    ];

    let total = 0;
    const datos = bitacoras.map(b => {
        const precio = b.tipo_horas === "Individual" ? precioIndividual : precioPaquete;
        const horas = b.horas_consumidas ?? 0;
        const monto = horas * precio;
        porcentajeComision = b.usuario?.comision??0;
        const comision = monto * (porcentajeComision / 100);
        total += monto;

        return [
            formatearFecha(b.fecha_servicio.toISOString()),
            b.id,
            b.no_ticket ?? campo_vacio,
            b.cliente?.empresa ?? `ID: ${b.cliente_id}`,
            horas,
            b.tipo_horas ?? campo_vacio,
            b.usuario?.comision,
            monto.toFixed(2),
            comision.toFixed(2)
        ].map(v => v === undefined ? null : v);
    }) as (string | number | null)[][];

    const comision = total * (porcentajeComision / 100);
    const usuario = bitacoras[0]?.usuario ?? null;
    const doc = generarReporte(
        "Reporte de Comisiones Técnico",  
        bitacoras,                       
        fechaInicio,                     
        fechaFinal,                      
        columnas,                        
        datos,                           
        {                              
            total: `L. ${total.toFixed(2)}`,
            comision: `L. ${comision.toFixed(2)}`,
        },
        {                               
            tecnico: safe(usuario?.nombre),
            correoUsuario: safe(usuario?.correo),
            telefono_usuario: safe(usuario?.telefono),
            zona: safe(usuario?.zona_asignada)
        }
    );

    return Buffer.from(doc.output('arraybuffer'));

}


export async function generarPDFPorVentasTecnico(bitacoras: BitacoraReporteVentas[], fechaInicio: string, fechaFinal: string): Promise<Buffer> {
   
    const usuario = bitacoras[0]?.usuario ?? null;
    const columnas = [
        "Fecha", "Bitacora No.", "Cliente", "Ventas"
    ];

    const datos = bitacoras.map(b => {

        return [
            formatearFecha(b.fecha_servicio.toISOString()),
            b.id,
            b.cliente?.empresa ?? `ID: ${b.cliente_id}`,
            b.ventas ?? campo_vacio
        ].map(v => v === undefined ? null : v);

    }) as (string | number | null)[][];

    const doc = generarReporte(
        "Reporte de Ventas Técnico",  
        bitacoras,                       
        fechaInicio,                     
        fechaFinal,                      
        columnas,                        
        datos,                           
        undefined,
        {
            tecnico: safe(usuario?.nombre),
            correoUsuario: safe(usuario?.correo),
            telefono_usuario: safe(usuario?.telefono),
            zona: safe(usuario?.zona_asignada)
        }
    );

    return Buffer.from(doc.output('arraybuffer'));

}


export function generarPDFPorCliente(bitacoras: BitacoraReporteCliente[], fechaInicio: string, fechaFinal: string): Buffer {
    
    const columnas = [
        "Fecha", "Ticket", "Servicio", "Modalidad", "Horas", "Tipo Horas", "Técnico", "Descripción"
    ];

    const datos = bitacoras.map(b => [
        formatearFecha(b.fecha_servicio.toISOString()),
        b.no_ticket,
        b.tipo_servicio?.descripcion,
        b.modalidad,
        b.horas_consumidas,
        b.tipo_horas,
        b.usuario?.nombre || campo_vacio,
        b.descripcion_servicio
    ].map(v => v === undefined ? null : v));

    const cliente = bitacoras.length > 0 ? bitacoras[0].cliente : null;
    const doc = generarReporte(
        "Reporte de Bitácoras Cliente",  
        bitacoras,                       
        fechaInicio,                     
        fechaFinal,                      
        columnas,                        
        datos,                           
        undefined,                       
        {                               
            cliente: cliente?.empresa ?? campo_vacio,
            responsable: cliente?.responsable || campo_vacio,
            rtn: cliente?.rtn || campo_vacio,
            direccion: cliente?.direccion || campo_vacio,
            telefono_cliente: cliente?.telefono || campo_vacio,
            correoCliente: cliente?.correo || campo_vacio
        }
    );

    return Buffer.from(doc.output('arraybuffer'));

}


const formatearFecha = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);

    if (isNaN(d.getTime())) return "Fecha inválida";

    const dia = d.getUTCDate().toString().padStart(2, "0");
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const año = d.getUTCFullYear();

    return `${dia}/${mes}/${año}`;
};


const formatearHora = (hora: string) => {
    if (!hora) return "";
    const d = new Date(hora);
    const horas = d.getHours().toString().padStart(2, "0");
    const minutos = d.getMinutes().toString().padStart(2, "0");

    return `${horas}:${minutos}`;
};


function renderInfoTecnico(doc: jsPDF, y: number, info: DatosExtrasReporte): number {

    const leftX = 10;
    const rightX = 150;
    const offset = 2;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Técnico:", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(safe(info.tecnico), leftX + doc.getTextWidth("Técnico:") + offset, y);

    y += 4;

    if (info.correoUsuario) {
        doc.setFont("helvetica", "bold");
        doc.text("Correo:", leftX, y);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.correoUsuario), leftX + doc.getTextWidth("Correo:") + offset, y);
    }

    if (info.zona) {
        doc.setFont("helvetica", "bold");
        doc.text("Zona:", rightX, y - 4);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.zona), rightX + doc.getTextWidth("Zona:") + offset, y - 4);
    }

    if (info.telefono_usuario) {
        doc.setFont("helvetica", "bold");
        doc.text("Teléfono:", rightX, y);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.telefono_usuario), rightX + doc.getTextWidth("Teléfono:") + offset, y);
    }

    return y;

}


function renderInfoCliente(doc: jsPDF, y: number, info: DatosExtrasReporte): number {

    const leftX = 10;
    const rightX = 150;
    const offset = 2; 

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(safe(info.cliente), leftX + doc.getTextWidth("Cliente:") + offset, y);

    y += 4;

    if (info.responsable) {
        doc.setFont("helvetica", "bold");
        doc.text("Responsable:", leftX, y);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.responsable), leftX + doc.getTextWidth("Responsable:") + offset, y);
        
        y += 4;
    }

    if (info.direccion) {
        doc.setFont("helvetica", "bold");
        doc.text("Zona:", leftX, y);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.direccion), leftX + doc.getTextWidth("Dirección:") + offset, y);
    }

    if (info.rtn) {
        doc.setFont("helvetica", "bold");
        doc.text("RTN:", rightX, y - 8);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.rtn), rightX + doc.getTextWidth("RTN:") + offset, y - 8);
    }

    if (info.telefono_cliente) {
        doc.setFont("helvetica", "bold");
        doc.text("Teléfono:", rightX, y - 4);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.telefono_cliente), rightX + doc.getTextWidth("Teléfono:") + offset, y - 4);
    }

    if (info.correoCliente) {
        doc.setFont("helvetica", "bold");
        doc.text("Correo:", rightX, y);
        doc.setFont("helvetica", "normal");
        doc.text(safe(info.correoCliente), rightX + doc.getTextWidth("Correo:") + offset, y);
    }

    return y;

}


function safe<T>(valor: T | null | undefined, fallback: string = campo_vacio): string {

    if (valor === null || valor === undefined || valor === "") return fallback;
    return String(valor);

}
