import { createHash, isValidPassword } from '../utils/utils.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
import userDTO from '../dao/DTOs/users.dto.js';
import { addLogger } from '../utils/logger.js';
import { getEmailFromToken, sendMailRestore } from '../utils/mailing.js';
import appConfig from '../config.js';

let mode = appConfig.mode

/**
 * Controlador para la gestión de sesiones de usuario.
 */
class sessionController {

    /**
     * Cierra la sesión del usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async logout(req, res) {
        addLogger(req, res, async () => {
            if (req.user) {
                req.user.last_connection = new Date();
                req.user.save();
            }
            req.session.destroy((err) => {
                if (err) {
                    req.logger.error('Sesión cerrada exitosamente')
                    return response.successResponse(res, 200, 'Sesión cerrada exitosamente', null);
                }
                req.loger.error('Error al cerrar sesión')
                return response.errorResponse(res, 500, 'Error al cerrar sesión');
            });
        });
    }

    /**
     * Registra a un nuevo usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async register(req, res) {
        let userData = req.user
        userData.last_connection = new Date();
        addLogger(req, res, () => {
            req.logger.info('Registrando nuevo usuario');
            response.successResponse(res, 201, 'Usuario registrado exitosamente', userData);
        });
    }

    /**
     * Maneja el fallo en el registro de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async failRegister(req, res) {
        addLogger(req, res, () => {
            req.logger.error('Fallo en el registro de usuario');
            console.log('error');
            response.errorResponse(res, 400, 'Falló el registro');
        });
    }

    /**
     * Inicia sesión de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async login(req, res) {
        addLogger(req, res, async () => {
            if (!req.user) {
                req.logger.error('Error en el inicio de sesión');
                return response.errorResponse(res, 400, 'Error en el inicio de sesión');
            }


            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                role: req.user.role || 'user',
                cartId: req.user.cart,
            };
            const user = userDTO(req.user);
            req.logger.info('Inicio de sesión exitoso');
            user.last_connection = new Date()
            if (mode === "dev") {
                const data = { user, userId: req.user._id.toString() };
                response.successResponse(res, 200, 'Inicio de sesión exitoso', data);
            } else {
                await req.user.save();
                response.successResponse(res, 200, 'Inicio de sesión exitoso', { user });
            }
        });
    }

    /**
     * Maneja el fallo en el inicio de sesión.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async failLogin(req, res) {
        addLogger(req, res, () => {
            req.logger.error('Fallo en el inicio de sesión');
            response.errorResponse(res, 400, 'Fallo en el inicio de sesión');
        });
    }

    /**
     * Inicia la autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async githubLogin(req, res) {
        addLogger(req, res, () => {
            req.logger.info('Iniciando autenticación con GitHub');
            response.successResponse(res, 200, 'Autenticación con GitHub iniciada', null);
        });
    }

    /**
     * Callback de autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async githubCallback(req, res) {
        addLogger(req, res, () => {
            try {
                if (req.user && req.user.last_name.trim() !== "") {
                    const message = "El usuario ya está registrado por fuera de GitHub";
                    req.logger.info(message);
                    return res.status(200).redirect('/login');
                } else {
                    req.session.user = {
                        first_name: req.user.first_name,
                        last_name: req.user.last_name,
                        email: req.user.email,
                        age: req.user.age,
                        role: req.user.role,
                        cartId: req.user.cart
                    };
                    req.logger.info('Callback de autenticación con GitHub');
                    res.redirect('/products');
                }
            } catch (error) {
                req.logger.error('Error en el callback de autenticación con GitHub: ' + error.message);
                res.status(500).json({ error: "Error en la autenticación con GitHub" });
            }
        });
    }
    /**
  * Restaura la contraseña de un usuario.
  * @param {object} req - Objeto de solicitud.
  * @param {object} res - Objeto de respuesta.
  */
    async restorePassword(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Restaurando contraseña de usuario');
            let email = getEmailFromToken(req.params.token);
            let { password } = req.body.obj;
            userModel.findOne({ email }).then(user => {
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 400, 'No se encuentra el usuario');
                }

                if (isValidPassword(user, password)) {
                    req.logger.error('La nueva contraseña es igual a la contraseña actual');
                    return response.errorResponse(res, 400, 'No es posible utilizar la misma contraseña');
                }

                const newPassword = createHash(password);

                userModel.updateOne({ _id: user._id }, { $set: { password: newPassword } }).then(() => {
                    req.logger.info('Contraseña actualizada correctamente');
                    response.successResponse(res, 200, 'Contraseña actualizada correctamente', null);
                });
            }).catch(err => {
                req.logger.error('Error al restaurar contraseña: ' + err.message);
                response.errorResponse(res, 500, 'Error al restaurar contraseña');
            });
        });
    }

    /**
     * Obtiene el usuario actualmente autenticado.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getCurrentUser(req, res) {
        addLogger(req, res, () => {
            if (req.session.user) {
                req.logger.info('Obteniendo usuario autenticado');
                const user = userDTO(req.session.user);
                response.successResponse(res, 200, 'Usuario autenticado', { user });
            } else {
                req.logger.error('Usuario no autenticado');
                response.errorResponse(res, 401, 'Usuario no autenticado');
            }
        });
    }


    /**
     * Envía un correo para restaurar la contraseña.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async mailRestore(req, res) {
        /**
         * @param {string} req.body.email - Correo electrónico del usuario.
         */
        addLogger(req, res, () => {
            req.logger.info('Verificando email');
            const { email } = req.body;
            userModel.findOne({ email }).then(user => {
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 400, 'No se encuentra el usuario');
                }
                sendMailRestore(email).then(() => {
                    req.logger.info('Email enviado');
                    response.successResponse(res, 200, 'Email enviado', null);
                });
            }).catch(err => {
                req.logger.error('Error al enviar el email: ' + err.message);
                response.errorResponse(res, 500, 'Error al enviar el email');
            });
        });
    }

};

export default new sessionController;