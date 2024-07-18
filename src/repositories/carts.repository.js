import CartDTO from "../dao/DTOs/carts.dto.js";

export default class CartRepository {

    /**
     * Constructor de la clase CartRepository.
     * @param {object} dao - Objeto que gestiona las operaciones del carrito.
     */
    constructor(dao) {
        this.dao = dao;
    }

    /**
     * Obtiene todos los carritos.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    getAll = async () => {
        let result = await this.dao.getAll();
        return result;
    }

    /**
     * Obtiene un carrito por su ID.
     * @param {string} id - ID del carrito.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    getCartById = async (id) => {
        let result = await this.dao.getCartById(id);
        return result;
    }

    /**
     * Crea un nuevo carrito.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    createCart = async () => {
        let result = await this.dao.createCart();
        return result;
    }

    /**
     * Agrega un producto al carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto a agregar.
     * @param {number} quantity - Cantidad del producto a agregar.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    addProductToCart = async (cartId, productId, quantity) => {
        let result = await this.dao.addProduct(cartId, productId, quantity);
        return result;
    }

    /**
     * Elimina un producto del carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto a eliminar.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    deleteProduct = async (cartId, productId) => {
        let result = await this.dao.deleteProduct(cartId, productId);
        return result;
    }

    /**
     * Actualiza el contenido del carrito.
     * @param {string} _id - ID del carrito.
     * @param {object} products - Productos a actualizar en el carrito.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    updateCart = async (_id, products) => {
        const cart = new CartDTO({_id, products});
        let result = await this.dao.updateCart(_id, cart);
        return result;
    }

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto.
     * @param {number} newQuantity - Nueva cantidad del producto.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    updateQuantity = async (cartId, productId, newQuantity) => {
        let result = await this.dao.updateQuantity(cartId, productId, newQuantity);
        return result;
    }

    /**
     * Elimina todos los productos del carrito.
     * @param {string} cartId - ID del carrito.
     * @returns {Promise<object>} - Resultado de la operación.
     */
    clearCart = async (cartId) => {
        let result = await this.dao.clearCart(cartId);
        return result;
    }
}