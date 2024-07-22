import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken'
import config from '../config.js'

/**
 * Opciones de configuración para enviar correos electrónicos.
 */
const mailOptions = {
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    port: 587,
    auth: {
        user: config.mail_username,
        pass: config.mail_password,
    },
};

/**
 * Función asincrónica para enviar un correo con instrucciones para restablecer la contraseña.
 * @param {string} email - Correo electrónico del destinatario.
 * @returns {string} Mensaje de confirmación del envío del correo.
 */
export async function sendMailRestore(email) {
    const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
    const transport = nodemailer.createTransport(mailOptions);

    try {
        const result = await transport.sendMail({
            from: `Correo de prueba`,
            to: email,
            subject: "Restablecer contraseña",
            html: `<div>
                <h1>Restablecer contraseña</h1>
                <h2>Haga click en el siguiente enlace para restablecer su contraseña</h2>
                <a href="${config.url}/restore/${token}">Restablecer Contraseña</a>
                <h3>El enlace caduca en una hora</h3>
            </div>`,
        });
        
        return "Correo enviado";
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error; 
    }
}

/**
 * Obtiene el correo electrónico desde un token JWT.
 * @param {string} token - Token JWT que contiene el correo electrónico.
 * @returns {string|null} Correo electrónico extraído del token o null si hay un error.
 */
export function getEmailFromToken(token) {
    try {
        // Decodificar el token para obtener los datos
        const decoded = jwt.verify(token, 'secretKey');
        // Recuperar el email de los datos decodificados
        const email = decoded.email;
        return email;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
}

export async function sendInactiveAccountNotification(userEmail, username) {
    try {
        // Enviar correo electrónico de notificación de cuenta inactiva
        const response = await sendMailInactiveAccount(userEmail, username);
        console.log(response); // Confirmación del envío del correo electrónico
    } catch (error) {
        console.error("Error al enviar la notificación de cuenta inactiva:", error);
        throw error;
    }
}

export async function sendMailInactiveAccount(email, username) {
    const transport = nodemailer.createTransport(mailOptions);

    try {
        const result = await transport.sendMail({
            from: `Correo de prueba`,
            to: email,
            subject: "Notificación de cuenta inactiva",
            html: `<div>
                <h1>Notificación de cuenta inactiva</h1>
                <p>Hola ${username},</p>
                <p>Tu cuenta ha sido eliminada debido a inactividad. Por favor, contáctanos si deseas recuperarla.</p>
            </div>`,
        });
        
        return "Correo de notificación enviado correctamente";
    } catch (error) {
        console.error("Error al enviar el correo de notificación:", error);
        throw error; 
    }
}

export async function sendMailProductDelete(email, username,product) {
    const transport = nodemailer.createTransport(mailOptions);

    try {
        const result = await transport.sendMail({
            from: `Correo de prueba`,
            to: email,
            subject: "Notificación de eliminacion de producto",
            html: `<div>
                <h1>Notificación de eliminacion de producto</h1>
                <p>Hola ${username},</p>
                <p>Se a eliminado el producto : ${product} de la base de datos.</p>
            </div>`,
        });
        
        return "Correo de notificación enviado correctamente";
    } catch (error) {
        console.error("Error al enviar el correo de notificación:", error);
        throw error; 
    }
}