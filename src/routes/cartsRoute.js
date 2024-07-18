// @ts-nocheck
import express from "express";
import cartControler from "../controllers/cartControler.js";

const cartsRoutes = express.Router();

/**
 * Ruta para obtener un carrito por ID.
 * @name GET /carts/:cid
 * @function
 */
cartsRoutes.get("/:cid", cartControler.getCartById);

/**
 * Ruta para crear un nuevo carrito.
 * @name POST /carts
 * @function
 */
cartsRoutes.post("/", cartControler.createCart);

/**
 * Ruta para agregar un producto a un carrito.
 * @name POST /carts/:cid/product/:pid
 * @function
 */
cartsRoutes.post("/:cid/product/:pid", cartControler.addProductToCart);

/**
 * Ruta para eliminar un producto de un carrito.
 * @name DELETE /carts/:cid/products/:pid
 * @function
 */
cartsRoutes.delete('/:cid/product/:pid', cartControler.deleteProduct);

/**
 * Ruta para actualizar un carrito.
 * @name PUT /carts/:cid
 * @function
 */
cartsRoutes.put('/:cid', cartControler.updateCart);

/**
 * Ruta para actualizar la cantidad de un producto en un carrito.
 * @name PUT /carts/:cid/products/:pid
 * @function
 */
cartsRoutes.put('/:cid/products/:pid', cartControler.updateQuantity);

/**
 * Ruta para limpiar un carrito.
 * @name DELETE /carts/:cid
 * @function
 */
cartsRoutes.delete('/:cid', cartControler.clearCart);

/**
 * Ruta para finalizar el proceso de compras.
 * @name POST /carts/:cid/purchase
 * @function
 */
cartsRoutes.post("/:cid/purchase", cartControler.completePurchase);

/**
 * Exporta los enrutadores de las rutas Carts.
 * @module cartsRoutes
 */
export default cartsRoutes;