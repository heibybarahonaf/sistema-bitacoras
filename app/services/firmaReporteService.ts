import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { prisma } from "../libs/prisma";
import { Firma, Bitacora, Prisma } from "@prisma/client";

let tipo_servicio = "";
type BitacoraConRelaciones = Prisma.BitacoraGetPayload<{
  include: {
    cliente: true;
    usuario: true;
    tipo_servicio: true;
    servicio: true;
    equipo: true;
    sistema: true;
    firmaCliente: true;
    firmaTecnico: true;
  };
}>;

export class FirmaReporteService {
  
    public static async generarReporteFirma(bitacoraId: number, tipo_servicio_in: string): Promise<Buffer> {

        tipo_servicio = tipo_servicio_in;

        const bitacora = await prisma.bitacora.findUnique({
            where: { id: bitacoraId },
            include: {
                cliente: true,
                usuario: true,
                tipo_servicio: true,
                equipo: true,
                sistema: true,
                firmaCliente: true
            },
        }) as BitacoraConRelaciones;

        if (!bitacora) {
            throw new Error("Bitácora no encontrada");
        }
        
        const doc = new jsPDF('p', 'mm', 'a4');
        this.configurarEncabezado(doc, bitacora);
        
        let currentY = 48;

        currentY = this.renderInfoCliente(doc, currentY, bitacora);
        currentY += 7;
        currentY = this.renderInfoBitacora(doc, currentY, bitacora);
        currentY += 7;

        const firmaTecnico = await prisma.firma.findFirst({ where: { tecnico_id: bitacora.usuario_id } });        
        const firmaCliente = bitacora.firmaCliente_id ? await prisma.firma.findUnique({ where: { id: bitacora.firmaCliente_id } }): null;
        await this.renderFirmas(doc, currentY, firmaTecnico, firmaCliente, bitacora);
        
        return Buffer.from(doc.output('arraybuffer'));

    }


    private static configurarEncabezado(doc: jsPDF, bitacora: Bitacora) {
      
        try {
            const logoPath = path.join(process.cwd(), "public", "logo-PosdeHonduras.png");

            if (fs.existsSync(logoPath)) {
                const imageBuffer = fs.readFileSync(logoPath);
                const imageBase64 = imageBuffer.toString("base64");
                const imgData = `data:image/png;base64,${imageBase64}`;
                doc.addImage(imgData, "PNG", 160, 18, 30, 15);
            }

        } catch {
            console.log("Logo no encontrado, continuando sin logo");
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE DE SERVICIO", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Bitácora #${bitacora.id}`, 20, 28);
        
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 20, 33);
        
        doc.setLineWidth(0.5);
        doc.line(20, 38, 190, 38);

    }


    private static renderInfoCliente(doc: jsPDF, startY: number, bitacora: BitacoraConRelaciones): number {

        let currentY = startY;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN CLIENTE", 20, currentY);

        currentY += 8;
        
        doc.setFontSize(10);
        
        const leftX = 20;
        const rightX = 130; 
        const labelAlignment = 40; 
        const rightLabelAlignment = 145; 
        
        doc.setFont("helvetica", "bold");
        doc.text("Cliente:", leftX, currentY);
        doc.setFont("helvetica", "normal");

        const nombreCliente = bitacora.cliente?.empresa || "N/A";
        const maxNombreWidth = rightX - labelAlignment - 5;
        const nombreLines = doc.splitTextToSize(nombreCliente, maxNombreWidth);

        for (let i = 0; i < nombreLines.length; i++) {
            doc.text(nombreLines[i], labelAlignment, currentY);
            if (i < nombreLines.length - 1) {
                currentY += 4;
            }
        }

        doc.setFont("helvetica", "bold");
        doc.text("Tel:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        
        let telefonoFormateado = "N/A";
        if (bitacora.cliente?.telefono) {
            const telefono = bitacora.cliente.telefono.toString().replace(/\D/g, '');

            if (telefono.length === 8) {
                telefonoFormateado = `${telefono.slice(0, 4)}-${telefono.slice(4)}`;
            } else {
                telefonoFormateado = bitacora.cliente.telefono; 
            }

        }

        doc.text(telefonoFormateado, rightLabelAlignment, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        doc.text("Correo:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.cliente?.correo || "N/A", labelAlignment, currentY);

        doc.setFont("helvetica", "bold");
        doc.text("RTN:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.cliente?.rtn || "N/A", rightLabelAlignment, currentY);

        currentY += 6;
        
        if (bitacora.cliente?.direccion) {
            doc.setFont("helvetica", "bold");
            doc.text("Dirección:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const direccionCompleta = bitacora.cliente.direccion;
            const maxWidth = 170 - (labelAlignment - leftX);
            const lines = doc.splitTextToSize(direccionCompleta, maxWidth);
            doc.text(lines[0], labelAlignment, currentY);

            if (lines.length > 1) {
                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], labelAlignment, currentY);
                }
            }

        } else {
            doc.setFont("helvetica", "bold");
            doc.text("Dirección:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text("N/A", labelAlignment, currentY);
        }

        currentY += 6;
        return currentY;

    }


    private static renderInfoBitacora(doc: jsPDF, startY: number, bitacora: BitacoraConRelaciones): number {

        let currentY = startY;
        const leftX = 20;
        const rightX = 110;
        const labelAlignment = 47; 
        const rightLabelAlignment = 130;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DEL SERVICIO", 20, currentY);

        currentY += 8;
        
        doc.setFontSize(10);
        
        doc.setFont("helvetica", "bold");
        doc.text("Ticket:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.no_ticket || "N/A", labelAlignment, currentY);
        
        doc.setFont("helvetica", "bold");
        doc.text("Fecha:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(new Date(bitacora.fecha_servicio).toLocaleDateString('es-ES'), rightLabelAlignment, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        doc.text("Servicio:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(tipo_servicio || "N/A", labelAlignment, currentY);
        
        doc.setFont("helvetica", "bold");
        doc.text("Técnico:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.usuario?.nombre || "N/A", rightLabelAlignment, currentY);

        currentY += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Tipo Hora:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.tipo_horas || "N/A", labelAlignment, currentY);
        
        doc.setFont("helvetica", "bold");
        doc.text("Monto:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.monto ? `Lps. ${bitacora.monto}.00` : "N/A", rightLabelAlignment, currentY);

        currentY += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Sistema:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.sistema?.sistema || "N/A", labelAlignment, currentY);
        
        doc.setFont("helvetica", "bold");
        doc.text("Hora llegada:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.hora_llegada ? new Date(bitacora.hora_llegada).toLocaleTimeString('es-ES') : "N/A", rightLabelAlignment+8, currentY);
        
        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        doc.text("Equipo:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.equipo?.equipo || "N/A", labelAlignment, currentY);
        
        doc.setFont("helvetica", "bold");
        doc.text("Hora salida:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.hora_salida ? new Date(bitacora.hora_salida).toLocaleTimeString('es-ES') : "N/A", rightLabelAlignment+9, currentY);
        
        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        doc.text("Capacitados:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(bitacora.nombres_capacitados || "N/A", labelAlignment, currentY);
        
        currentY += 6;
        
        if (bitacora.descripcion_servicio) {
            doc.setFont("helvetica", "bold");
            doc.text("Descripción:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const descripcionCompleta = bitacora.descripcion_servicio;
            const maxWidth = 170 - (labelAlignment - leftX);
            const lines = doc.splitTextToSize(descripcionCompleta, maxWidth);
            doc.text(lines[0], labelAlignment, currentY);
            
            if (lines.length > 1) {
                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], leftX, currentY);
                }
            }
            
            currentY += 6;
        }
        
        if (bitacora.ventas) {
            doc.setFont("helvetica", "bold");
            doc.text("Ventas:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const descripcionCompleta = bitacora.ventas;
            const maxWidth = 170 - (labelAlignment - leftX);
            const lines = doc.splitTextToSize(descripcionCompleta, maxWidth);
            doc.text(lines[0], labelAlignment, currentY);

            if (lines.length > 1) {
                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], leftX, currentY);
                }
            }

        }
        
        currentY += 6;

        if (bitacora.comentarios) {
            doc.setFont("helvetica", "bold");
            doc.text("Comentarios:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const comentariosCompleto = bitacora.comentarios;
            const maxWidth = 170 - (labelAlignment - leftX);
            const lines = doc.splitTextToSize(comentariosCompleto, maxWidth);
            doc.text(lines[0], labelAlignment, currentY);
            
            if (lines.length > 1) {
                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], leftX, currentY);
                }
            }

            currentY += 6;
        }
        
        return currentY;
    }


    private static async renderFirmas(doc: jsPDF, startY: number, firmaTecnico: Firma | null, firmaCliente: Firma | null, bitacora: BitacoraConRelaciones): Promise<number> {
        
        let currentY = startY;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FIRMAS DE AUTORIZACIÓN", 20, currentY);

        currentY += 10;
        
        const firmaWidth = 60;
        const firmaHeight = 30;
        const leftX = 30;
        const rightX = 120;
        
        if (firmaTecnico?.firma_base64) {

            try {
                let firmaBase64 = firmaTecnico.firma_base64;

                if (!firmaBase64.startsWith('data:image/')) {
                    firmaBase64 = `data:image/png;base64,${firmaBase64}`;
                }
                
                doc.addImage(firmaBase64, 'PNG', leftX, currentY, firmaWidth, firmaHeight);

            } catch {

                doc.setFontSize(20);
                doc.setFont("helvetica", "normal");
                doc.text("-", leftX + firmaWidth/2, currentY + firmaHeight/2);

            }

        } else {

            doc.setFontSize(20);
            doc.setFont("helvetica", "normal");
            doc.text("-", leftX + firmaWidth/2, currentY + firmaHeight/2);

        }
        
        if (firmaCliente?.firma_base64) {

            try {

                let firmaBase64 = firmaCliente.firma_base64;
                if (!firmaBase64.startsWith('data:image/')) {
                    firmaBase64 = `data:image/png;base64,${firmaBase64}`;
                }
                
                doc.addImage(firmaBase64, 'PNG', rightX, currentY, firmaWidth, firmaHeight);

            } catch {

                doc.setFontSize(20);
                doc.setFont("helvetica", "normal");
                doc.text("-", rightX + firmaWidth/2, currentY + firmaHeight/2);

            }

        } else {

            doc.setFontSize(20);
            doc.setFont("helvetica", "normal");
            doc.text("-", rightX + firmaWidth/2, currentY + firmaHeight/2);

        }
        
        currentY += firmaHeight + 5;
        
        doc.setLineWidth(0.5);
        doc.line(leftX, currentY, leftX + firmaWidth, currentY);
        doc.line(rightX, currentY, rightX + firmaWidth, currentY);
        
        currentY += 5;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const firmaTextoTecnico = "Firma Técnico";
        const firmaTextoResponsable = "Firma Responsable";
        const firmaTextoTecnicoWidth = doc.getTextWidth(firmaTextoTecnico);
        const firmaTextoResponsableWidth = doc.getTextWidth(firmaTextoResponsable);
        
        doc.text(firmaTextoTecnico, leftX + (firmaWidth - firmaTextoTecnicoWidth) / 2, currentY);
        doc.text(firmaTextoResponsable, rightX + (firmaWidth - firmaTextoResponsableWidth) / 2, currentY);
        
        currentY += 10;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const nombreTecnico = bitacora.usuario?.nombre || "N/A";
        const nombreResponsable = bitacora.cliente?.responsable || "N/A";
        const nombreTecnicoWidth = doc.getTextWidth(nombreTecnico);
        const nombreResponsableWidth = doc.getTextWidth(nombreResponsable);
        
        doc.text(nombreTecnico, leftX + (firmaWidth - nombreTecnicoWidth) / 2, currentY);
        doc.text(nombreResponsable, rightX + (firmaWidth - nombreResponsableWidth) / 2, currentY);
        
        currentY += 3;
        
        doc.setLineWidth(0.3);
        doc.line(leftX, currentY, leftX + firmaWidth, currentY);
        doc.line(rightX, currentY, rightX + firmaWidth, currentY);
        
        currentY += 5;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const nombreTextoTecnico = "Nombre Técnico";
        const nombreTextoResponsable = "Nombre Responsable";
        const nombreTextoTecnicoWidth = doc.getTextWidth(nombreTextoTecnico);
        const nombreTextoResponsableWidth = doc.getTextWidth(nombreTextoResponsable);
        
        doc.text(nombreTextoTecnico, leftX + (firmaWidth - nombreTextoTecnicoWidth) / 2, currentY);
        doc.text(nombreTextoResponsable, rightX + (firmaWidth - nombreTextoResponsableWidth) / 2, currentY);
        
        currentY += 8;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        let fechaTecnico = firmaTecnico?.firma_base64;
        if ( firmaTecnico && fechaTecnico && fechaTecnico.length > 10 && firmaTecnico.createdAt ) {
            fechaTecnico = `${new Date(bitacora.createdAt).toLocaleDateString('es-ES')} - ${new Date(bitacora.fecha_servicio).toLocaleTimeString('es-ES')}`;
        } else {
            fechaTecnico = " - ";
        }

        let fechaCliente = firmaCliente?.firma_base64;
        if ( fechaCliente && fechaCliente.length > 10 && firmaCliente && firmaCliente.createdAt ) {
            fechaCliente = `${new Date(firmaCliente.createdAt).toLocaleDateString('es-ES')} - ${new Date(firmaCliente.createdAt).toLocaleTimeString('es-ES')}`;
        } else {
            fechaCliente = " - ";
        }

        
        const fechaTecnicoWidth = doc.getTextWidth(fechaTecnico);
        const fechaClienteWidth = doc.getTextWidth(fechaCliente);
        
        doc.text(fechaTecnico, leftX + (firmaWidth - fechaTecnicoWidth) / 2, currentY);
        doc.text(fechaCliente, rightX + (firmaWidth - fechaClienteWidth) / 2, currentY);
        
        return currentY + 10;

    }

}
