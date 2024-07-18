import winston, { format } from 'winston';
import appConfig from '../config.js';

// Definir opciones personalizadas de niveles y colores de registro
const customLevelOptions = {
    levels: {
        debug: 5,
        http: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        debug: "cyan",
        http: "green",
        info: "blue",
        warn: "yellow",
        error: "red",
        fatal: "magenta",
    },
};

// Agregar colores personalizados a los niveles de registro
winston.addColors(customLevelOptions.colors);

// Definir formato personalizado para los registros
const customFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

// Configuración del logger para entorno de desarrollo
const devLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.simple()
            )
        })
    ]
});

// Configuración del logger para entorno de producción
const prodLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    format: customFormat,
    transports: [
        new winston.transports.File({ filename: './logs/production.log', level: 'info'}),
        new winston.transports.File({ filename: './logs/errors.log', level: 'error'})
    ]
});

/**
 * Añade el logger a la solicitud y respuesta.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export const addLogger = (req, res, next) => {
    // Seleccionar el logger adecuado según el entorno de la aplicación
    if (appConfig.mode === 'dev') {
        req.logger = devLogger;
    } else {
        req.logger = prodLogger;        
    }
    next();
};