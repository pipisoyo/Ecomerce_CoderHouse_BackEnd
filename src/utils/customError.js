/**
 * Clase para crear errores personalizados.
 */
export class CustomError {
    /**
     * Crea un nuevo error personalizado.
     * @param {string} name - Nombre del error.
     * @param {string} message - Mensaje de error.
     * @param {number} code - Código de error.
     * @param {string} description - Descripción del error.
     * @returns {Error} Objeto de error personalizado.
     */
    static CustomError(name, message, code, description) {
        let error = new Error(message);
        error.name = name;
        error.code = code;
        error.description = description;    
        return error;
    }
}