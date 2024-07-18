import ProductDTO from "../dao/DTOs/products.dto.js";

export default class ProductRepository {
    constructor(dao) {
        this.dao = dao;
    }

    /**
     * Obtiene todos los productos.
     * @returns {Promise} Promise con el resultado de la consulta.
     */
    getAll = async () => {
        let result = await this.dao.getAll();
        return result;
    }

    /**
     * Obtiene un producto por su ID.
     * @param {string} id - ID del producto.
     * @returns {Promise} Promise con el resultado de la consulta.
     */
    getById = async (id) => {
        let result = await this.dao.getById(id);
        return result;
    }

    /**
     * Agrega un nuevo producto.
     * @param {Object} productData - Datos del producto a agregar.
     * @returns {Promise} Promise con el resultado de la operación.
     */
    addProduct = async (productData) => {
        // Aplicar el DTO para mapear los datos del producto
        const product = new ProductDTO(productData);
        let result = await this.dao.addProduct(product);
        return result;
    }

    /**
     * Inserta un nuevo documento de producto.
     * @param {Object} product - Documento del producto a insertar.
     * @returns {Promise} Promise con el resultado de la operación.
     */
    insertDocument = async (product) => {
        let result = await this.dao.insertDocument(product);
        return result;
    }

    /**
     * Actualiza un producto.
     * @param {string} id - ID del producto a actualizar.
     * @param {Object} productData - Datos del producto actualizado.
     * @returns {Promise} Promise con el resultado de la operación.
     */
    updateProduct = async (id, productData) => {
        // Aplicar el DTO para mapear los datos actualizados del producto
        const product = new ProductDTO(productData);
        let result = await this.dao.updateProduct(id, product);

        return result;
    }

    /**
     * Elimina un producto.
     * @param {string} id - ID del producto a eliminar.
     * @returns {Promise} Promise con el resultado de la operación.
     */
    deleteProduct = async (id) => {
        let result = await this.dao.deleteProduct(id);
        return result;
    }
    
}   