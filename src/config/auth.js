/**
 * Middleware para verificar la autenticación del usuario.
 * Redirige al usuario a la página de inicio de sesión si no está autenticado.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export function auth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    next();
}

/**
 * Middleware para verificar la autorización del usuario.
 * Permite el acceso si el usuario es un administrador o si el carrito solicitado pertenece al usuario.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export function authCartUserAndAdmin(req, res, next) {
    const requestedCartId = req.params.cid;

    if ((req.session.user && req.session.user.cartId === requestedCartId) || req.session.user.role === 'admin') {
        next();
    } else {
        return res.status(403).send({ status: "error", error: "Acceso denegado" });
    }
}

export function authCartUser(req, res, next) {
    const requestedCartId = req.params.cid;

    if (req.session.user && req.session.user.cartId === requestedCartId) {
        next();
    } else {
        return res.status(403).send({ status: "error", error: "Acceso denegado" });
    }
}

/**
 * Middleware para verificar la autorización del usuario basado en roles.
 * Permite el acceso si el usuario tiene uno de los roles especificados.
 * @param {Array} role - Roles permitidos para acceder.
 * @returns {Function} Middleware para verificar la autorización del usuario.
 */
export const authUser = (role) => {
    /**
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     * @param {function} next - Función para pasar al siguiente middleware.
    */
   return (req, res, next) => {
       if (!req.session.user) {
           return res.status(401).json({ status: "error", message: "Usuario no autenticado" })
           }

           const userRole = req.session.user.role;
           
           if (!role.includes(userRole)) {
            return res.status(403).json({ status: "error", message: "Acceso denegado" });
        }

        next();
    };
};

