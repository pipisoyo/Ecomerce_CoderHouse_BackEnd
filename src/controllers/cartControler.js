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
class CartController {
    /**
     * Obtiene un carrito por su ID.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async getCartById(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Getting a cart by its ID');

            const cid = req.params.cid;

            try {
                const cart = await cartsService.getCartById(cid);

                if (cart.error) {
                    req.logger.warn('Cart does not exist');
                    response.errorResponse(res, 404, "Cart does not exist");
                } else {
                    req.logger.info('Cart retrieved successfully');
                    response.successResponse(res, 200, "Cart retrieved successfully", cart);
                }
            } catch (error) {
                req.logger.error('Error retrieving cart: ' + error.message);
                response.errorResponse(res, 500, "Error retrieving the Cart");
            }
        });
    }

    /**
     * Crea un nuevo carrito.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async createCart(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Creating a new cart');

            try {
                const newCart = await cartsService.createCart();
                req.logger.info('Cart created successfully');
                response.successResponse(res, 201, "Cart created successfully", newCart);
            } catch (error) {
                req.logger.error('Error creating the cart: ' + error.message);
                console.error("Error creating the cart:", error);
                response.errorResponse(res, 500, "Error creating the Cart");
            }
        });
    }

    /**
     * Agrega un producto al carrito.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async addProductToCart(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Adding a product to the cart');
            const pid = req.params.pid;
            const cid = req.params.cid;
            const quantity = req.body.quantity || 1;
            let user = req.session.user;

            try {
                let cart = await cartsService.getCartById(cid);

                if (!cart || cart.length === 0) {
                    cart = await cartsService.createCart();
                }

                let product = await productsService.getById(pid);

                if (user.role === "premium" && product.owner === user.email) {
                    req.logger.warn('You cannot add products you created');
                    return response.errorResponse(res, 404, "You cannot add products you created");
                }

                await cartsService.addProductToCart(cid, pid, quantity);
                req.logger.info('Product added to cart successfully');
                return response.successResponse(res, 201, "Product added to cart");
            } catch (error) {
                req.logger.error('Error adding the product to the cart: ' + error.message);
                return response.errorResponse(res, 500, "Error adding the product to the Cart");
            }
        });
    }

    /**
     * Elimina un producto del carrito.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async deleteProduct(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Deleting a product from the cart');
            const cid = req.params.cid;
            const pid = req.params.pid;

            try {
                await cartsService.deleteProduct(cid, pid);
                req.logger.info('Product deleted from the cart successfully');
                response.successResponse(res, 200, "Product deleted from the cart");
            } catch (error) {
                req.logger.error('Error trying to delete the product from the cart: ' + error.message);
                response.errorResponse(res, 500, "Error trying to delete the product from the cart");
            }
        });
    }

    /**
 * Actualiza el contenido del carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
    /**
 * Actualiza el contenido del carrito.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
    async updateCart(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Updating cart content');

            const cid = req.params.cid;
            const products = req.body.products;

            try {
                await cartsService.updateCart(cid, products);
                req.logger.info('Cart updated successfully');
                response.successResponse(res, 200, "Cart updated");
            } catch (error) {
                req.logger.error('Error trying to update the cart: ' + error.message);
                response.errorResponse(res, 500, "Error trying to update the cart");
            }
        });
    }

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async updateQuantity(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Updating quantity of a product in the cart');

            const cid = req.params.cid;
            const pid = req.params.pid;
            const quantity = req.body.quantity;

            try {
                await cartsService.updateQuantity(cid, pid, quantity);
                req.logger.info('Product quantity updated successfully');
                response.successResponse(res, 200, "Product quantity updated");
            } catch (error) {
                req.logger.error('Error trying to update the product quantity: ' + error.message);
                response.errorResponse(res, 500, "Error trying to update the product quantity");
            }
        });
    }

    /**
     * Limpia el carrito eliminando todos los productos.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    async clearCart(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Clearing the cart, removing all products');

            const cid = req.params.cid;
            const products = [];

            try {
                await cartsService.updateCart(cid, products);
                req.logger.info('All products removed from the cart successfully');
                response.successResponse(res, 200, "All products removed from the cart");
            } catch (error) {
                req.logger.error('Error removing products from the cart: ' + error.message);
                response.errorResponse(res, 500, "Error removing products from the cart");
            }
        });
    }



    /**
      * Completes the purchase process of a cart.
      * @param {Object} req - Object of HTTP request.
      * @param {Object} res - Object of HTTP response.
      */
    async completePurchase(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Completing the purchase process of a cart');
            
            const cid = req.params.cid;

            try {
                // Obtaining the cart by its ID
                const cart = await cartsService.getCartById(cid);

                const productsToPurchase = [];
                const productsNotPurchased = [];

                for (let index = 0; index < cart.products.length; index++) {
                    const productId = cart.products[index].product._id.toString();
                    const productData = await productsService.getById(productId);

                    if (productData.stock >= cart.products[index].quantity) {
                        productData.stock -= cart.products[index].quantity;
                        await cartsService.deleteProduct(cart._id.toString(), productId);
                        await productsService.updateProduct(productId, productData);
                        productsToPurchase.push(cart.products[index]);
                    } else {
                        productsNotPurchased.push({
                            product: cart.products[index].product,
                            quantity: cart.products[index].quantity
                        });
                    }
                }

                let purchaser = req.user.email || req.user.first_name

                if (productsToPurchase.length > 0) {
                    const ticketData = {
                        code: generateUniqueCode(cart._id, new Date()),
                        purchase_datetime: new Date(),
                        amount: calculateTotalAmount(productsToPurchase),
                        purchaser: purchaser,
                        productsToPurchase
                    };

                    const newTicket = new ticketModel(ticketData);
                    await newTicket.save();

                    if (productsNotPurchased.length > 0) {
                        const id = cart._id.toString();
                        await cartsService.updateCart(id, productsNotPurchased);
                        sendMail(newTicket);
                        req.logger.warn('Some products could not be processed');
                        response.successResponse(res, 207, "Some products could not be processed", { productsNotPurchased, newTicket });
                    } else {
                        sendMail(newTicket);
                        req.logger.info('Purchase completed successfully');
                        response.successResponse(res, 200, "Purchase completed successfully", newTicket);
                    }
                } else {
                    req.logger.warn('A ticket was not generated as there are no products to purchase');
                    response.errorResponse(res, 409, "A ticket was not generated as there are no products to purchase");
                }

            } catch (error) {
                req.logger.error('Error completing the purchase: ' + error.message);
                response.errorResponse(res, 500, "Error completing the purchase");
            }
        });

    }
}

export default new CartController();

