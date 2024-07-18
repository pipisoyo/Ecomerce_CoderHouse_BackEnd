
import cartsModel from '../dao/models/carts.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
import cartControler from './cartControler.js';
import jwt from 'jsonwebtoken';
import { Products } from '../dao/factory.js';
import ticketModel from '../dao/models/tickets.js';
import { addLogger } from '../utils/logger.js';


const productsServices = new Products();

/**
 * Controlador para la gestión de las vistas y renderizado de páginas.
 */
const viewsController = {

    /**
     * Renderiza la vista del chat.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderChat: (req, res) => {
        res.render('chat');
    },

    /**
     * Renderiza la vista de productos con paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderProducts: (req, res) => {
        addLogger(req, res, async () => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
    
            try {
                const products = await productsServices.getAll();
                const carts = await cartsModel.find({}).lean().exec();
                const users = await userModel.find({}).lean().exec();
                const totalCount = products.totalCount;
                const totalPages = Math.ceil(totalCount / limit);
                req.logger.info('Obteniendo productos y datos relacionados');
    
                const user = req.session.user;
                const role = req.session.user.role;
                const cartId = req.session.user.cartId;
    
                const results = await productsServices.getAll(limit, page);
    
                const prevLink = page > 1 ? `?limit=${limit}&page=${page - 1}` : null;
                const nextLink = page < totalPages ? `?limit=${limit}&page=${page + 1}` : null;
    
                const result = role === "admin";
    
                res.render('products', {
                    users,
                    user,
                    carts,
                    products: results.result,
                    prevLink,
                    nextLink,
                    result,
                    cartId
                });
            } catch (error) {
                req.logger.error('Error al obtener los productos: ' + error.message);
                response.errorResponse(res, 500, "Error al obtener los productos");
            }
        });
    },

    /**
     * Renderiza la vista del carrito de compras.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderCart: (req, res) => {
        addLogger(req, res, async () => {
            const cid = req.params.cid;
            console.log("🚀 ~ addLogger ~ cid:", cid)
    
            try {
                const cart = await cartsModel.findById(cid).populate('products.product').lean().exec();
                console.log("🚀 ~ addLogger ~ cart:", cart)
                const products = cart.products.map(element => ({
                    ...element.product,
                    quantity: element.quantity
                }));
                req.logger.info('Obteniendo datos del carrito y productos asociados');
    
                const user = req.session.user;
    
                res.render('cart', { cart, cid, products, user });
            } catch (error) {
                req.logger.error('Error en la base de datos: ' + error.message);
                response.errorResponse(res, 500, "Error en la base de datos");
            }
        });
    },

    /**
     * Renderiza la vista de registro de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderRegister: (req, res) => {
        res.render('register');
    },

    /**
     * Renderiza la vista de inicio de sesión.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderLogin: (req, res) => {
        res.render('login');
    },

    /**
     * Renderiza la vista del perfil de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderProfile: (req, res) => {
        res.render('profile', { user: req.session.user });
    },

    /**
     * Renderiza la vista para restaurar contraseña.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderRestore: (req, res) => {
        addLogger(req, res, async () => {
            const token = req.params.token; 
            jwt.verify(token, 'secretKey', (err, decoded) => {
                if (err) {
                    res.send('<script>alert("El enlace ha caducado o es inválido. Solicita un nuevo enlace de recuperación."); window.location.href = "/login";</script>');
                } else {
                    res.render('restore',{token});
                }
            });
        });
    },

        /**
     * Renderiza la vista para restaurar contraseña.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
        renderMailRestore: (req, res) => {
            res.render('mailRestore');
        },

        /**
     * Renderiza la vista de productos con paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
        renderTicket: (req, res) => {
            addLogger(req, res, async () => {
                try {
                    const ticketCode = req.params.tcode;
                    const ticket = await ticketModel.findOne({ code: ticketCode }).lean().exec();
                    req.logger.info('Obteniendo datos del ticket');
        
                    const result = await ticketModel.findOne({ code: ticketCode }).populate('productsToPurchase.product').lean().exec();
                    let products = result.productsToPurchase.map(element => ({
                        ...element.product,
                        quantity: element.quantity
                    }));
        
                    res.render('ticket', { ticket, products });
                } catch (error) {
                    req.logger.error('Error en la base de datos: ' + error.message);
                    response.errorResponse(res, 500, "Error en la base de datos");
                }
            });
        },
};

export default viewsController;