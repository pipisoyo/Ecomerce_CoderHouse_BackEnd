// @ts-nocheck
import express from "express";
import cartControler from "../controllers/cartControler.js";
import { auth, authCartUser } from "../config/auth.js";

const cartsRoutes = express.Router();

/**
 * Ruta para obtener un carrito por ID.
 * @name GET /carts/:cid
 * @function
 */
cartsRoutes.get("/:cid",authCartUser, cartControler.getCartById);

/**
 * Ruta para crear un nuevo carrito.
 * @name POST /carts
 * @function
 */
cartsRoutes.post("/",auth, cartControler.createCart);

/**
 * Ruta para agregar un producto a un carrito.
 * @name POST /carts/:cid/product/:pid
 * @function
 */
cartsRoutes.post("/:cid/product/:pid",authCartUser, cartControler.addProductToCart);

/**
 * Ruta para eliminar un producto de un carrito.
 * @name DELETE /carts/:cid/products/:pid
 * @function
 */
cartsRoutes.delete('/:cid/product/:pid',authCartUser, cartControler.deleteProduct);

/**
 * Ruta para actualizar un carrito.
 * @name PUT /carts/:cid
 * @function
 */
cartsRoutes.put('/:cid',authCartUser, cartControler.updateCart);

/**
 * Ruta para actualizar la cantidad de un producto en un carrito.
 * @name PUT /carts/:cid/products/:pid
 * @function
 */
cartsRoutes.put('/:cid/products/:pid',authCartUser, cartControler.updateQuantity);

/**
 * Ruta para limpiar un carrito.
 * @name DELETE /carts/:cid
 * @function
 */
cartsRoutes.delete('/:cid',authCartUser, cartControler.clearCart);

/**
 * Ruta para finalizar el proceso de compras.
 * @name POST /carts/:cid/purchase
 * @function
 */
cartsRoutes.post("/:cid/purchase",authCartUser, cartControler.completePurchase);

/**
 * Exporta los enrutadores de las rutas Carts.
 * @module cartsRoutes
 */
export default cartsRoutes;