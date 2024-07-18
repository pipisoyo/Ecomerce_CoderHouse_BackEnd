import cartsModel from "../models/carts.js";
/**
 * Clase que gestiona las operaciones relacionadas con los productos.
 * @class CartsManagerMongo
 */
class CartsManager {

    /**
     * Obtiene un carrito por su ID.
     * @param {string} id - ID del carrito a buscar.
     * @returns {Promise<object>} - Carrito encontrado.
     */
    async getCartById(id) {

        try {
            return await cartsModel.findById(id).populate('products.product').lean().exec();
        } catch (error) {
            throw new Error("Error al obtener el carrito por ID");
        }
    }

    /**
     * Crea un nuevo carrito.
     * @returns {Promise<object>} - Nuevo carrito creado.
     */
    async createCart() {
        try {
            return await cartsModel.create({});
        } catch (error) {
            throw new Error("Error al crear un nuevo carrito");
        }
    }

     /**
     * Agrega un producto a un carrito.
     * @param {string} cid - ID del carrito.
     * @param {string} pid - ID del producto a agregar.
     * @param {number} quantity - Cantidad del producto a agregar.
     * @returns {Promise<object>} - Carrito actualizado con el producto agregado.
     */
     async addProduct(cid, pid, quantity) {
        try {
            let cart = await cartsModel.findById(cid);
            let product = cart.products.find((product) => product.product.toString() === pid);
            if (product) {
                product.quantity += quantity;
            } else {
                cart.products.push({ product: pid, quantity });
            }
            return await cart.save();
        } catch (error) {
            throw new Error("Error al agregar un producto al carrito");
        }
    }

    /**
     * Elimina un producto de un carrito.
     * @param {string} cid - ID del carrito.
     * @param {string} pid - ID del producto a eliminar.
     * @returns {Promise<object>} - Carrito actualizado sin el producto eliminado.
     */
    async deleteProduct(cid, pid) {
        try {
            let cart = await cartsModel.findById(cid);
            let productIndex = cart.products.findIndex((product) => product.product.toString() === pid);
            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            } else {
                cart.products.splice(productIndex, 1);
                return await cart.save();
            }
        } catch (error) {
            throw new Error("Error al eliminar un producto del carrito");
        }
    }

     /**
     * Actualiza el contenido de un carrito.
     * @param {string} cid - ID del carrito a actualizar.
     * @param {object} newCart - Nuevo contenido del carrito.
     * @returns {Promise<object>} - Carrito actualizado con el nuevo contenido.
     */
     async updateCart(cid, newCart) {
        try {
            let cart = await cartsModel.findById(cid);
            cart.products = newCart.products;
            return await cart.save();
        } catch (error) {
            throw new Error("Error al actualizar el contenido del carrito");
        }
    }

     /**
     * Actualiza la cantidad de un producto en un carrito.
     * @param {string} cid - ID del carrito.
     * @param {string} pid - ID del producto.
     * @param {number} newQuantity - Nueva cantidad del producto.
     * @returns {Promise<object>} - Carrito actualizado con la cantidad del producto modificada.
     */
     async updateQuantity(cid, pid, newQuantity) {

        try {
            let cart = await cartsModel.findById(cid)
            let product = cart.products.find((product) => {
                
                return product.product.toString() === pid
            })
            if (product) {
                product.quantity = newQuantity;
                return await cart.save();
            } else {
                throw new Error("Producto no encontrado en el carrito");
            }
        } catch (error) {
            throw new Error("Error al actualizar la cantidad de un producto en el carrito");
        }
    }
}

export default CartsManager;