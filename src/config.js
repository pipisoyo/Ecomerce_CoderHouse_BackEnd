/**
 * Módulo para la gestión de variables de entorno.
 */
import dotenv from "dotenv";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
/**
 * Carga las variables de entorno desde el archivo .env.
 */
dotenv.config();

/**
 * Configuración de variables de entorno para la aplicación.
 * @typedef {Object} AppConfig
 * @property {string} port - Puerto en el que se ejecutará la aplicación.
 * @property {string} mongo_url - URL de conexión a la base de datos MongoDB.
 * @property {string} adminUser - Nombre de usuario del administrador.
 * @property {string} adminPassword - Contraseña del administrador.
 * @property {string} secret - Clave secreta para la aplicación.
 *  @property {string} persistence - Peristencias
 */
const appConfig = {
    port: process.env.PORT,
    mongo_url: process.env.MONGO_URL,
    adminUser: process.env.ADMIN_USER,
    adminPassword: process.env.ADMIN_PASSWORD,
    secret: process.env.SECRET,
    persistence : process.env.PERSISTENCE,
    mail_username : process.env.MAIL_USERNAME,
    mail_password : process.env.MAIL_PASSWORD,
    mode : process.env.MODE,
    url: process.env.URL
};



export default appConfig;

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename)

