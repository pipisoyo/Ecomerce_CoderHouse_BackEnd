/**
 * Función que crea un objeto de transferencia de datos (DTO) para un usuario.
 * @param {object} user - Objeto de usuario con los datos a incluir en el DTO.
 * @returns {object} Objeto de transferencia de datos con los campos first_name, last_name, email, age y role.
 */

/**
* Clase que gestiona las operaciones relacionadas con los productos.
* @class userDTO
*/

const userDTO = (user) => {
    const { first_name, last_name, email, age, role } = user;
    return { first_name, last_name, email, age, role };
};

export default userDTO;