/**
 * Clase que representa un Producto en forma de Data Transfer Object (DTO).
 * 
 * /**
 * Clase que gestiona las operaciones relacionadas con los productos.
 * @class ProductDTO
 */
export default class ProductDTO {
    /**
     * Crea una instancia de ProductDTO.
     * @param {object} params - Parámetros del producto.
     * @param {string} params.title - El título del producto.
     * @param {string} params.description - La descripción del producto.
     * @param {number} params.price - El precio del producto.
     * @param {string} params.code - El código del producto.
     * @param {number} params.stock - El stock disponible del producto.
     * @param {boolean} params.status - El estado del producto (activo/inactivo).
     * @param {string} params.category - La categoría a la que pertenece el producto.
     * @param {Array} params.thumbnails - Las miniaturas del producto.
    
     */ 
    // @param {string} params.owner - tipo de usuario
    constructor({ title, description, price, code, stock, status, category, thumbnails, owner  }) {
        // Validación de datos
        if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || 
            typeof code !== 'string' || typeof stock !== 'number' || typeof status !== 'boolean' || 
            typeof category !== 'string' || typeof owner !== 'string' ){
            throw new Error('Los datos proporcionados no son válidos');
        }

        // Manejo de valores nulos o por defecto
        this.title = title || '';
        this.description = description || '';
        this.price = price || 0;
        this.code = code || '';
        this.stock = stock || 0;
        this.status = status || true;
        this.category = category || '';
        this.thumbnails = thumbnails || [];
        this.owner = owner || 'admin';
        // Inmutabilidad
        Object.freeze(this);
    }
}