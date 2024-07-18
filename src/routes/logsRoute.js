import express from "express";
// Ruta para probar los logs
const logsRoute = express.Router()

logsRoute.get('/', (req, res) => {
    // Logger de nivel debug
    req.logger.debug('Este es un mensaje de debug');

    // Logger de nivel http
    req.logger.http('Este es un mensaje HTTP');

    // Logger de nivel info
    req.logger.info('Este es un mensaje informativo');

    // Logger de nivel warning
    req.logger.warning('Esto es una advertencia');

    // Logger de nivel error
    req.logger.error('Este es un mensaje de error');

    // Logger de nivel fatal
   // req.logger.fatal('Este es un mensaje fatal');

    res.send('Logs probados con éxito');
});

export default logsRoute;