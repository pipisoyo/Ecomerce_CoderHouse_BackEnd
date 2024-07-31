import { Router } from 'express';
import { auth, authCartUser, authUser, authCartUserAndAdmin } from '../config/auth.js';
import viewsController from '../controllers/viewsControler.js';
//import { Products } from "../dao/memory/products.memory.js";

const viewRoutes = Router();

/**
 * Ruta para renderizar la vista de chat.
 * @name GET /chat
 * @function
 */
viewRoutes.get('/chat', auth, viewsController.renderChat);

/**
 * Ruta para renderizar la vista de productos.
 * @name GET /products
 * @function
 */
viewRoutes.get('/products', auth, viewsController.renderProducts);

/**
 * Ruta para renderizar la vista de carrito.
 * @name GET /cart/:cid
 * @function
 */
viewRoutes.get('/cart/:cid',authCartUserAndAdmin, viewsController.renderCart);

/**
 * Ruta para renderizar la vista de registro.
 * @name GET /register
 * @function
 */
viewRoutes.get('/register', viewsController.renderRegister);

/**
 * Ruta para renderizar la vista de inicio de sesión.
 * @name GET /login
 * @function
 */
viewRoutes.get('/login', viewsController.renderLogin);

/**
 * Ruta para renderizar la vista de perfil.
 * @name GET /
 * @function
 */
viewRoutes.get('/', auth, viewsController.renderProfile);

/**
 * Ruta para renderizar la vista de restablecimiento de contraseña.
 * @name GET /restore
 * @function
 */
viewRoutes.get('/restore/:token', viewsController.renderRestore);

/**
 * Ruta para renderizar la vista de restablecimiento de contraseña.
 * @name GET /restore
 * @function
 */
viewRoutes.get('/mailRestore', viewsController.renderMailRestore);
/**
 * Ruta para renderizar la vista de generación del ticket.
 * @name GET /ticket/:tcode
 * @function
 */
viewRoutes.get('/ticket/:tcode', viewsController.renderTicket);

viewRoutes.get('/admin', authUser(["admin"]), viewsController.renderAdminUsers);

/**
 * Exporta los enrutadores de las rutas viewes.
 * @module viewRoutes
 */
export default viewRoutes;