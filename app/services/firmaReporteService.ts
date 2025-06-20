import path from "path";
import fs from "fs";
import { jsPDF } from "jspdf";
import { prisma } from "../libs/prisma";
import { BitacoraService } from "./bitacoraService";

export class FirmaReporteService {
  
    public static async generarReporteFirma(bitacoraId: number): Promise<Buffer> {
        const bitacora = await BitacoraService.obtenerBitacorasConFirma(bitacoraId);
        const doc = new jsPDF('p', 'mm', 'a4');
        this.configurarEncabezado(doc, bitacora);
        
        let currentY = 60;

        currentY = this.renderInfoCliente(doc, currentY, bitacora);
        currentY += 10;
        currentY = this.renderInfoBitacora(doc, currentY, bitacora);
        currentY += 20;

        const firmaTecnico = bitacora.firmaTecnico_id ? await prisma.firma.findUnique({ where: { id: bitacora.firmaTecnico_id } }): null;
        const firmaCliente = bitacora.firmaCLiente_id ? await prisma.firma.findUnique({ where: { id: bitacora.firmaCLiente_id } }): null;
        currentY = await this.renderFirmas(doc, currentY, firmaTecnico, firmaCliente, bitacora);
        
        return Buffer.from(doc.output('arraybuffer'));

    }


    private static configurarEncabezado(doc: jsPDF, bitacora: any) {
      
        try {
            const logoPath = path.join(process.cwd(), "public", "logo-PosdeHonduras.png");

            if (fs.existsSync(logoPath)) {
                const imageBuffer = fs.readFileSync(logoPath);
                const imageBase64 = imageBuffer.toString("base64");
                const imgData = `data:image/png;base64,${imageBase64}`;
                doc.addImage(imgData, "PNG", 160, 18, 30, 15);
            }

        } catch (error) {
            console.log("Logo no encontrado, continuando sin logo");
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("REPORTE DE SERVICIO", 20, 20);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Bitácora #${bitacora.id}`, 20, 30);
        
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 20, 35);
        
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

    }


    private static renderInfoCliente(doc: jsPDF, startY: number, bitacora: any): number {
        let currentY = startY;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN CLIENTE", 20, currentY);

        currentY += 8;
        
        doc.setFontSize(10);
        
        const leftX = 20;
        const rightX = 110;
        
        doc.setFont("helvetica", "bold");
        const clienteWidth = doc.getTextWidth("Cliente:");
        doc.text("Cliente:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.cliente?.empresa || "N/A"), leftX + clienteWidth, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const correoWidth = doc.getTextWidth("Correo:");
        doc.text("Correo:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.cliente?.correo || "N/A"), leftX + correoWidth, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const telefonoWidth = doc.getTextWidth("Teléfono:");
        doc.text("Teléfono:", leftX, currentY);
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

        doc.text(" " + telefonoFormateado, leftX + telefonoWidth, currentY);
        const direccionLarga = bitacora.cliente?.direccion && bitacora.cliente.direccion.length > 50;

        if (!direccionLarga) {
            doc.setFont("helvetica", "bold");
            const rtnWidth = doc.getTextWidth("RTN:");
            doc.text("RTN:", rightX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(" " + (bitacora.cliente?.rtn || "N/A"), rightX + rtnWidth, currentY);
        }

        currentY += 6;
        
        if (direccionLarga) {
            doc.setFont("helvetica", "bold");
            const rtnWidth = doc.getTextWidth("RTN:");
            doc.text("RTN:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(" " + (bitacora.cliente?.rtn || "N/A"), leftX + rtnWidth, currentY);

            currentY += 6;
        }
        
        if (bitacora.cliente?.direccion) {
            doc.setFont("helvetica", "bold");
            const direccionWidth = doc.getTextWidth("Dirección:");
            doc.text("Dirección:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const direccionCompleta = " " + bitacora.cliente.direccion;
            const maxWidth = 170 - direccionWidth;
            const lines = doc.splitTextToSize(direccionCompleta, maxWidth);
            doc.text(lines[0], leftX + direccionWidth, currentY);

            if (lines.length > 1) {
              
                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], leftX + direccionWidth, currentY);
                }

            }

        } else {
            doc.setFont("helvetica", "bold");
            const direccionWidth = doc.getTextWidth("Dirección:");
            doc.text("Dirección:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(" N/A", leftX + direccionWidth, currentY);
        }

        currentY += 6;
        return currentY;
    }


    private static renderInfoBitacora(doc: jsPDF, startY: number, bitacora: any): number {
        let currentY = startY;
        const leftX = 20;
        const rightX = 110;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DEL SERVICIO", 20, currentY);

        currentY += 8;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        doc.setFont("helvetica", "bold");
        const ticketWidth = doc.getTextWidth("Ticket:");
        doc.text("Ticket:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.no_ticket || "N/A"), leftX + ticketWidth, currentY);
        
        doc.setFont("helvetica", "bold");
        const fechaWidth = doc.getTextWidth("Fecha:");
        doc.text("Fecha:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + new Date(bitacora.fecha_servicio).toLocaleDateString('es-ES'), rightX + fechaWidth, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const servicioWidth = doc.getTextWidth("Servicio:");
        doc.text("Servicio:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.tipo_servicio || "N/A"), leftX + servicioWidth, currentY);
        
        doc.setFont("helvetica", "bold");
        const tecnicoWidth = doc.getTextWidth("Técnico:");
        doc.text("Técnico:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.usuario?.nombre || "N/A"), rightX + tecnicoWidth, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const tipoHoraWidth = doc.getTextWidth("Tipo Hora:");
        doc.text("Tipo Hora:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.tipo_horas || "N/A"), leftX + tipoHoraWidth, currentY);
        
        doc.setFont("helvetica", "bold");
        const montoWidth = doc.getTextWidth("Monto:");
        doc.text("Monto:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.monto ? `Lps. ${bitacora.monto}.00` : "N/A"), rightX + montoWidth, currentY);

        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const sistemaWidth = doc.getTextWidth("Sistema:");
        doc.text("Sistema:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.sistema?.sistema || "N/A"), leftX + sistemaWidth, currentY);
        
        doc.setFont("helvetica", "bold");
        const horaLlegadaWidth = doc.getTextWidth("Hora llegada:");
        doc.text("Hora llegada:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.hora_llegada ? new Date(bitacora.hora_llegada).toLocaleTimeString('es-ES') : "N/A"), rightX + horaLlegadaWidth, currentY);
        
        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const equipoWidth = doc.getTextWidth("Equipo:");
        doc.text("Equipo:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.equipo?.equipo || "N/A"), leftX + equipoWidth, currentY);
        
        doc.setFont("helvetica", "bold");
        const horaSalidaWidth = doc.getTextWidth("Hora salida:");
        doc.text("Hora salida:", rightX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.hora_salida ? new Date(bitacora.hora_salida).toLocaleTimeString('es-ES') : "N/A"), rightX + horaSalidaWidth, currentY);
        
        currentY += 6;
        
        doc.setFont("helvetica", "bold");
        const capacitadosWidth = doc.getTextWidth("Capacitados:");
        doc.text("Capacitados:", leftX, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(" " + (bitacora.capacitados || "N/A"), leftX + capacitadosWidth, currentY);
        
        currentY += 6;
        
        if (bitacora.descripcion_servicio) {
            doc.setFont("helvetica", "bold");
            const descripcionWidth = doc.getTextWidth("Descripción del servicio:");
            doc.text("Descripción del servicio:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const descripcionCompleta = " " + bitacora.descripcion_servicio;
            const maxWidth = 170 - descripcionWidth;
            const lines = doc.splitTextToSize(descripcionCompleta, maxWidth);
            doc.text(lines[0], leftX + descripcionWidth, currentY);

            if (lines.length > 1) {

                for (let i = 1; i < lines.length; i++) {
                    currentY += 4;
                    doc.text(lines[i], leftX, currentY);
                }

            }

            currentY += 6;
        }
        
        if (bitacora.comentarios) {
            doc.setFont("helvetica", "bold");
            const comentariosWidth = doc.getTextWidth("Comentarios:");
            doc.text("Comentarios:", leftX, currentY);
            doc.setFont("helvetica", "normal");
            
            const comentariosCompleto = " " + bitacora.comentarios;
            const maxWidth = 170 - comentariosWidth;
            const lines = doc.splitTextToSize(comentariosCompleto, maxWidth);
            doc.text(lines[0], leftX + comentariosWidth, currentY);

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


    private static async renderFirmas(doc: jsPDF, startY: number, firmaTecnico: any, firmaCliente: any, bitacora: any): Promise<number> {
        let currentY = startY;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FIRMAS DE AUTORIZACIÓN", 20, currentY);

        currentY += 15;
        
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

            } catch (error) {

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

            } catch (error) {

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
        
        currentY += 5;
        
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
        
        currentY += 15;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        let fechaTecnico = firmaTecnico?.firma_base64;
        if(fechaTecnico && fechaTecnico.length > 10) {
            fechaTecnico = `${new Date(firmaTecnico.createdAt).toLocaleDateString('es-ES')} - ${new Date(firmaTecnico.createdAt).toLocaleTimeString('es-ES')}`;
        } else {
            fechaTecnico = " - ";
        }

        let fechaCliente = firmaCliente?.firma_base64;
        if(fechaCliente && fechaCliente.length > 10) {
            fechaCliente = `${new Date(firmaTecnico.createdAt).toLocaleDateString('es-ES')} - ${new Date(firmaTecnico.createdAt).toLocaleTimeString('es-ES')}`;
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
