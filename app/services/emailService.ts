import nodemailer from "nodemailer";
import { ResponseDto } from "../common/dtos/response.dto";

interface DatosVenta {
    cliente?: string;
    ventas?: string;
    tecnico?: string;
    rtn?: string;
    telefono?: string;
    correo?: string;
}


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/*
transporter.verify().then(() => {
    console.log("Listo para enviar correos");
}).catch((err) => {
    console.error("Error al verificar el transporte de correo:", err);
});*/


export class EmailService {

    public static async enviarCodigoAcceso(destinatario: string, codigo: string): Promise<void> {
        const html = this.plantillaHtmlCodigo(codigo);

        try {

            await transporter.sendMail({
                from: `"Notificaciones POS" <${process.env.EMAIL_USER}>`,
                to: destinatario,
                subject: "Código de acceso",
                text: `Tu código de inicio de sesión es: ${codigo}`,
                html,
            });

        } catch {

            throw new ResponseDto(500, "Error al enviar el correo");
        
        }

    }


    private static plantillaHtmlCodigo(codigo: string): string {

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Código de Inicio de Sesión</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 0;">
                <tr>
                    <td align="center">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Código de Acceso</h1>
                            </div>
                        <div style="padding: 40px 30px;">
                        <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
                            Usa el siguiente código para iniciar sesión en tu cuenta:
                        </p>
                        <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px dashed #cbd5e0; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                            <div style="font-size: 32px; font-weight: bold; color: #2d3748; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                            ${codigo}
                            </div>
                        </div>
                        <div style="background-color: #fff5f5; border-left: 4px solid #fed7d7; padding: 16px; border-radius: 6px; margin: 24px 0;">
                            <p style="margin: 0; color: #c53030; font-size: 14px; font-weight: 500;">
                            Exp: <strong>10 minutos</strong>
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="margin: 0 0 16px; color: #718096; font-size: 14px;">
                            Si no solicitaste este código, puedes ignorar este mensaje.
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                            Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                        </div>
                        </div>
                        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                            © POS de Honduras. Todos los derechos reservados.
                        </p>
                        </div>
                    </div>
                    </td>
                </tr>
                </table>
            </body>
            </html>
        `;
    
    }


    public static async enviarNotificacionVenta(destinatario: string, datosVenta: DatosVenta): Promise<void> {
    const html = this.plantillaHtmlVentas(datosVenta);

    try {

        await transporter.sendMail({
            from: `"Notificaciones POS" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `Nueva Oportunidad de Venta - ${datosVenta.cliente}`,
            text: `Nueva oportunidad de venta reportada por ${datosVenta.tecnico}:
                Cliente: ${datosVenta.cliente}
                Teléfono: ${datosVenta.telefono}
                Correo: ${datosVenta.correo}
                RTN: ${datosVenta.rtn}
                Detalles: ${datosVenta.ventas}
                Técnico: ${datosVenta.tecnico}`,
                html,
            });

        } catch {

            throw new ResponseDto(500, "Error al enviar la notificación de venta");

        }

    }


    private static plantillaHtmlVentas(datos: DatosVenta): string {

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Notificación de Oportunidad de Venta</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 0;">
                <tr>
                    <td align="center">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
                        
                        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 26px; font-weight: 600;">Oportunidad de Venta</h1>
                            <p style="margin: 10px 0 0; color: #fecaca; font-size: 14px;">Notificación para Departamento de Marketing</p>
                        </div>
                        
                        <div style="padding: 40px 30px;">
                            
                            <div style="margin-bottom: 35px;">
                                <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                                    Información del Cliente
                                </h2>
                                
                                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; padding: 25px; border-left: 4px solid #3b82f6;">
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                                                <strong style="color: #475569; font-size: 14px;">Nombre:</strong>
                                            </td>
                                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                                                ${datos.cliente}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                                                <strong style="color: #475569; font-size: 14px;">Teléfono:</strong>
                                            </td>
                                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                                                <a href="tel:${datos.telefono}" style="color: #2563eb; text-decoration: none;">${datos.telefono}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                                                <strong style="color: #475569; font-size: 14px;">Correo:</strong>
                                            </td>
                                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                                                <a href="mailto:${datos.correo}" style="color: #2563eb; text-decoration: none;">${datos.correo}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                                                <strong style="color: #475569; font-size: 14px;">RTN:</strong>
                                            </td>
                                            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: 'Courier New', monospace;">
                                                ${datos.rtn}
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>

                            <div style="margin-bottom: 35px;">
                                <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                                    Detalles de la Venta
                                </h2>
                                
                                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 10px; padding: 25px; border-left: 4px solid #10b981;">
                                    <div style="font-size: 16px; color: #064e3b; line-height: 1.6;">
                                        ${datos.ventas}
                                    </div>
                                </div>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                                    Técnico Responsable
                                </h2>
                                
                                <div style="background: linear-gradient(135deg, #fef3e2 0%, #fef7ed 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #f59e0b;">
                                    <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                                        ${datos.tecnico}
                                    </p>
                                </div>
                            </div>

                            <div style="text-align: center; margin-top: 30px;">
                                <p style="margin: 0; color: #64748b; font-size: 12px;">
                                    Notificación generada el ${new Date().toLocaleDateString('es-HN', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px; font-weight: 500;">
                                Sistema POS - Notificaciones Automáticas
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © POS de Honduras. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                    </td>
                </tr>
                </table>
            </body>
            </html>
        `;
    
    }

}
