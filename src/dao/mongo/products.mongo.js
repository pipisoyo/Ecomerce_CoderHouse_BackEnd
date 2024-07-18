import productsModel from "../models/products.js";

/**
 * Clase que gestiona las operaciones relacionadas con los productos.
 * @class ProductsManagerMongo
 */
class Products {

    /**
     * Obtiene todos los productos paginados y filtrados.
     * @param {number} limit - Límite de productos a mostrar por página.
     * @param {number} page - Página de resultados.
     * @param {object} sortOption - Opción de ordenamiento.
     * @param {object} filter - Filtro de búsqueda.
     * @returns {Promise<object>} - Resultados de la consulta y total de productos.
     */
    async getAll  (limit = 0, page = 0, sortOption, filter) {
        try {
            let totalCount = await productsModel.countDocuments(filter);
            let options = {
                limit: limit === 0 ? totalCount : limit,
                page: page,
                sort: sortOption,
                lean: true
            };
            let result = await productsModel.paginate(filter, options);
            return { result : result.docs, totalCount };
        } catch (error) {
            console.error("Error al obtener todos los productos:", error);
            throw error;
        }
    }

    /**
     * Obtiene un producto por su ID.
     * @param {string} id - ID del producto.
     * @returns {Promise<object>} - El producto encontrado.
     */
    async getById (id) {
        try {
            let result = await productsModel.findOne({ _id: id }).lean();
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Agrega un nuevo producto.
     * @param {object} newProduct - Datos del nuevo producto.
     * @returns {Promise<object>} - El producto creado.
     */
    async addProduct(newProduct) {
        try {
            let result = await productsModel.create(newProduct);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Agrega varios productos.
     * @param {Array<object>} products - Lista de productos a agregar.
     * @returns {Promise<Array>} - Lista de productos creados.
     */
    async insertDocument (products) {
        console.log("🚀 ~ Products ~ addProducts ~ products:", products)
        try {
            let result = await productsModel.insertMany(products);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza un producto por su ID.
     * @param {string} id - ID del producto a actualizar.
     * @param {object} productData - Nuevos datos del producto.
     * @returns {Promise<object>} - Resultado de la actualización.
     */
    async updateProduct (id, productData) {
        try {
            let result = await productsModel.updateOne({ _id: id }, productData);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Elimina un producto por su ID.
     * @param {string} id - ID del producto a eliminar.
     * @returns {Promise<object>} - Resultado de la eliminación.
     */
    async deleteProduct (id) {
        try {
            let result = await productsModel.deleteOne({ _id: id });
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default Products ;