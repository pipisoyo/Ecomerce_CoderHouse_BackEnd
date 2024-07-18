/**
 * Importación de módulos y configuraciones necesarias.
 */
import express from "express";
import handlebars from 'express-handlebars'
import {__dirname} from "./config.js";
import initilizePassport from "./config/passport.config.js";
import appMiddlewares from './config/appMiddlewares.js';
import { app } from './config/server.js';
import { productsRouter, cartsRoutes, sessionsRouter, viewesRoutes, logsRoute, userRouter } from './routes/routes.js'
import initSocket from './socket.js';
import realTimeProducts from "./routes/realTimeProductsRoute.js";
import { generateProducts } from "./utils/utils.js";
import { errorHandler } from "./middleweres/errorHandler.middleware.js"
import { addLogger } from "./utils/logger.js";
import epecs from "./config/docsConfig.js"
import swggerUoExpress from 'swagger-ui-express'
// Middlewares
/**
 * Middlewares de la aplicación.
 */
app.use(appMiddlewares);

app.use('/apidocs', swggerUoExpress.serve ,swggerUoExpress.setup(epecs))
// Rutas
/**
 * Definición de las rutas de la aplicación.
 */
app.use(addLogger)
app.use("/api/realtimeproducts", realTimeProducts);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRoutes);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", userRouter);
app.use("/loggerTest",logsRoute)
app.use(viewesRoutes);

// Genera productos aleatorios
/**
 * Ruta para generar productos aleatorios.
 */
app.get('/mockingproducts/:numOfProducts', (req, res) => {
    const numOfProducts = req.params.numOfProducts
    const products = generateProducts(numOfProducts);
    res.json(products); 
});

// Handlebars
/**
 * Configuración de Handlebars para las vistas.
 */
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars');

// Middleware de manejo de errores
/**
 * Middleware para manejo de errores.
 */
app.use(errorHandler);

// Passport - autenticación
/**
 * Inicialización de Passport para autenticación.
 */
initilizePassport();

// Socket (realtime)
/**
 * Inicialización de Socket para comunicación en tiempo real.
 */
initSocket();