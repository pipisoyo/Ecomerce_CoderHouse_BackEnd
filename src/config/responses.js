/**
 * Objeto que contiene funciones para enviar respuestas JSON estandarizadas.
 */
const response = {
    /**
     * Envia una respuesta de éxito con un mensaje y datos.
     * @param {object} res - Objeto de respuesta.
     * @param {number} statusCode - Código de estado de la respuesta.
     * @param {string} message - Mensaje de la respuesta.
     * @param {any} data - Datos de la respuesta.
     */
    successResponse: (res, statusCode, message, data) => {
        res.status(statusCode).json({ success: true, statusCode, message, data });
    },

    /**
     * Envia una respuesta de error con un mensaje.
     * @param {object} res - Objeto de respuesta.
     * @param {number} statusCode - Código de estado de la respuesta.
     * @param {string} message - Mensaje de error.
     */
    errorResponse: (res, statusCode, message) => {
        res.status(statusCode).json({ success: false, message });
    }
};

export default response;