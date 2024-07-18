import { io } from "socket.io-client";
import response from "../config/responses.js";
import ticketModel from "../dao/models/tickets.js";
import { cartsService } from "../repositories/index.js";
import { productsService } from "../repositories/index.js";
import { calculateTotalAmount, generateUniqueCode, sendMail } from "../utils/utils.js";
import { addLogger } from "../utils/logger.js";

/**
 * Controlador para la gestión de carritos.
 */
const cartControler = {

    /**
     * Recupera un carrito por su ID.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    /**
 * Obtiene un carrito por su ID.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
    getCartById: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Obteniendo un carrito por su ID');

            const cid = req.params.cid;

            try {
                const cart = await cartsService.getCartById(cid);

                if (cart.error) {
                    req.logger.warn('El carrito no existe');
                    response.errorResponse(res, 404, "El carrito no existe");
                } else {
                    req.logger.info('Carrito recuperado exitosamente');
                    response.successResponse(res, 200, "Carrito recuperado exitosamente", cart);
                }
            } catch (error) {
                req.logger.error('Error al recuperar el carrito: ' + error.message);
                response.errorResponse(res, 500, "Error al recuperar el Carrito");
            }
        });
    },
    /**
     * Crea un nuevo carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    createCart: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Creando un nuevo carrito');

            try {
                const newCart = await cartsService.createCart();
                req.logger.info('Carrito creado exitosamente');
                response.successResponse(res, 201, "Carrito creado exitosamente", newCart);
            } catch (error) {
                req.logger.error('Error al crear el carrito: ' + error.message);
                console.error("Error al crear el carrito:", error);
                response.errorResponse(res, 500, "Error al crear el Carrito");
            }
        });
    },

    /**
 * Agrega un producto al carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
    addProductToCart: (req, res) => {
        addLogger(req, res, async () => {
            /**
             * @param {string} req.params.pid - ID del producto a agregar.
             * @param {string} req.params.cid - ID del carrito al que se agrega el producto.
             * @param {number} quantity - Cantidad del producto a agregar (por defecto: 1).
             */
            req.logger.info('Agregando un producto al carrito');

            const pid = req.params.pid;
            const cid = req.params.cid;
            const quantity = 1;
            let user = req.session.user;

            try {
                let cart = await cartsService.getCartById(cid);

                if (!cart || cart.length === 0) {
                    cart = await cartsService.createCart();
                }
                
                let product = await productsService.getById(pid);

                if (user.role === "premium" && product.owner === user.email) {
                    req.logger.warn('No puede agregar productos que creaste');
                    return response.errorResponse(res, 404, "No puede agregar productos que creaste");
                }

                await cartsService.addProductToCart(cid, pid, quantity);
                req.logger.info('Producto agregado al carrito con éxito');
                return response.successResponse(res, 201, "Producto agregado al carrito");
            } catch (error) {
                req.logger.error('Error al intentar agregar el producto al carrito: ' + error.message);
                return response.errorResponse(res, 500, "Error al intentar agregar el producto al Carrito");
            }
        });
    },

    /**
 * Elimina un producto del carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
    deleteProduct: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Eliminando un producto del carrito');

            const cid = req.params.cid;
            const pid = req.params.pid;

            try {
                await cartsService.deleteProduct(cid, pid);
                req.logger.info('Producto eliminado del carrito con éxito');
                response.successResponse(res, 200, "Producto eliminado del carrito");
            } catch (error) {
                req.logger.error('Error al intentar eliminar el producto del carrito: ' + error.message);
                response.errorResponse(res, 500, "Error al intentar eliminar el producto del carrito");
            }
        });
    },

    /**
 * Actualiza el contenido del carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
    updateCart: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Actualizando el contenido del carrito');

            const cid = req.params.cid;
            const products = req.body.products;

            try {
                await cartsService.updateCart(cid, products);
                req.logger.info('Carrito actualizado con éxito');
                response.successResponse(res, 200, "Carrito actualizado");
            } catch (error) {
                req.logger.error('Error al intentar actualizar el carrito: ' + error.message);
                response.errorResponse(res, 500, "Error al intentar actualizar el carrito");
            }
        });
    },

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    updateQuantity: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Actualizando la cantidad de un producto en el carrito');

            const cid = req.params.cid;
            const pid = req.params.pid;
            console.log("🚀 ~ addLogger ~ pid:", pid)
            const quantity = req.body.quantity;
            console.log("🚀 ~ addLogger ~ quantity:", quantity)

            try {
                await cartsService.updateQuantity(cid, pid, quantity);
                req.logger.info('Cantidad de producto actualizada con éxito');
                response.successResponse(res, 200, "Cantidad de producto actualizada");
            } catch (error) {
                req.logger.error('Error al intentar actualizar la cantidad del producto: ' + error.message);
                response.errorResponse(res, 500, "Error al intentar actualizar la cantidad del producto");
            }
        });
    },

    /**
     * Limpia el carrito eliminando todos los productos.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    clearCart: (req, res) => {
        addLogger(req, res, async () => {
            req.logger.info('Limpiando el carrito, eliminando todos los productos');

            const cid = req.params.cid;
            const products = [];

            try {
                await cartsService.updateCart(cid, products);
                req.logger.info('Todos los productos eliminados del carrito con éxito');
                response.successResponse(res, 200, "Todos los productos eliminados del carrito");
            } catch (error) {
                req.logger.error('Error al eliminar los productos del carrito: ' + error.message);
                response.errorResponse(res, 500, "Error al eliminar los productos del carrito");
            }
        });
    },


    /**
     * Finaliza el proceso de compra de un carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    completePurchase: (req, res) => {
        addLogger(req, res, async () => {
            
            req.logger.info('Finalizando el proceso de compra de un carrito');
            const cid = req.params.cid;

            try {
                // Obtener el carrito por su ID
                const cart = await cartsService.getCartById(cid);

                // Verificar el stock de los productos en el carrito
                const productsToPurchase = [];
                const productsNotPurchased = [];

                for (let index = 0; index < cart.products.length; index++) {
                    const productId = cart.products[index].product._id.toString();
                    const productData = await productsService.getById(productId);

                    // Verificar y actualizar el stock del producto
                    if (productData.stock >= cart.products[index].quantity) {
                        productData.stock -= cart.products[index].quantity;
                        await cartsService.deleteProduct(cart._id.toString(), productId);
                        await productsService.updateProduct(productId, productData);
                        productsToPurchase.push(cart.products[index]);
                    } else {
                        productsNotPurchased.push({ product: cart.products[index].product, quantity: cart.products[index].quantity });
                    }
                }
                let purchaser = req.user.email || req.user.first_name

                // Verificar si hay productos para comprar antes de generar un ticket
                if (productsToPurchase.length > 0) {
                    // Generar un ticket con los datos de la compra
                    const ticketData = {
                        code: generateUniqueCode(cart._id, new Date()),
                        purchase_datetime: new Date(),
                        amount: calculateTotalAmount(productsToPurchase),
                        purchaser: purchaser,
                        productsToPurchase
                    };

                    // Crear un nuevo ticket utilizando el modelo de Ticket de Mongoose
                    const newTicket = new ticketModel(ticketData);
                    await newTicket.save();

                    // Manejo de productos no comprados
                    if (productsNotPurchased.length > 0) {
                        const id = cart._id.toString();
                        await cartsService.updateCart(id, productsNotPurchased);
                        sendMail(newTicket);
                        req.logger.warn('Algunos productos no se pudieron procesar');
                        response.successResponse(res, 207, "Algunos productos no se pudieron procesar", { productsNotPurchased, newTicket });
                    } else {
                        sendMail(newTicket);
                        req.logger.info('Compra realizada exitosamente');
                        response.successResponse(res, 200, "Compra realizada exitosamente", newTicket);
                    }
                } else {
                    req.logger.warn('No se generó un ticket ya que no hay productos para comprar');
                    response.errorResponse(res, 409, "No se generó un ticket ya que no hay productos para comprar");
                }

            } catch (error) {
                req.logger.error('Error al finalizar la compra: ' + error.message);
                response.errorResponse(res, 500, "Error al finalizar la compra");
            }
        });
          
    
    },

};

/**
 * Exporta los enrutadores de las rutas Carts.
 * @controlers
 */
export default cartControler;