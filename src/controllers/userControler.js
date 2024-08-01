import response from '../config/responses.js';
import userModel from '../dao/models/users.js';
import UserManager from '../dao/mongo/user.mongo.js';
import { addLogger } from '../utils/logger.js';
import fs from 'fs';
import { sendInactiveAccountNotification } from '../utils/mailing.js';

const users = new UserManager();

class UserController {

    async getAll(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('obteniendo usuarios');
            try {
                const result = await users.getAll();
                const usersResponse = result.map(user => ({
                    first_name: user.first_name,
                    email: user.email,
                    role: user.role,
                    last_conection : user.last_connection
                }));
                req.logger.info('Usuarios recuperados');
                return response.successResponse(res, 200, "Usuarios recuperados con éxito", usersResponse);
            } catch (error) {
                req.logger.error("Error al recuperar los usuarios");
                return response.errorResponse(res, 500, "Error al recuperar los usuarios");
            }
        });
    }

    premiun(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Verificando información');
            const { uid } = req.params;
            userModel.findById(uid).then(user => {
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 404, 'No se encuentra el usuario');
                }

                if (user.role === "user") {
                    req.logger.debug('Verificando documentación requerida');
                    const requiredDocuments = ['identificacion', 'domicilio', 'cuenta'];
                    const userDocuments = user.documents.map(document => document.name);
                    if (requiredDocuments.some(doc => !userDocuments.includes(doc))) {
                        req.logger.error('Faltan documentos requeridos en la base de datos');
                        return response.errorResponse(res, 400, 'Faltan documentos requeridos en la base de datos para actualizar a premium');
                    }
                }

                let newRole = user.role === "premiun" ? "user" : "premiun";

                userModel.updateOne({ _id: uid }, { role: newRole }).then(() => {
                    req.logger.info(`Rol actualizado a ${newRole}`);
                    response.successResponse(res, 200, `Rol actualizado a ${newRole}, por favor vuelva a iniciar sesión`, null);
                }).catch(err => {
                    req.logger.error('Error al actualizar el rol: ' + err.message);
                    response.errorResponse(res, 500, 'Error al actualizar el rol');
                });
            });
        });
    }

    async uploadDocuments(req, res) {
        const { uid } = req.params;
        const files = req.files;
        addLogger(req, res, async () => {
            try {
                const user = await userModel.findById(uid);
                if (!user) {
                    req.logger.error("Usuario no encontrado");
                    return response.errorResponse(res, 404, 'Usuario no encontrado');
                }
                Object.keys(files).forEach(field => {
                    const file = files[field][0];
                    const fieldname = file.filename;
                    const existingDocumentIndex = user.documents.findIndex(doc => doc.name === field);
                    if (existingDocumentIndex !== -1) {
                        const oldFilePath = user.documents[existingDocumentIndex].reference;
                        fs.unlinkSync(oldFilePath); // Eliminar el archivo anterior
                        user.documents[existingDocumentIndex].reference = file.path;
                        req.logger.info(`Documento ${field} actualizado correctamente`); // Sobrescribir el documento existente
                    } else {
                        user.documents.push({ name: field, reference: file.path });
                        req.logger.info("Documento cargado correctamente"); // Agregar nuevo documento
                        
                    }
                });

                // Actualizar el estado del usuario
                user.status = 'Documentos subidos';
                await user.save();
                return response.successResponse(res, 200, 'Documentos subidos exitosamente');
            } catch (error) {
                req.logger.error("Error al subir los documentos");
                return response.errorResponse(res, 500, 'Error al subir los documentos');
            };
        });
    }

    async delate(req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Obteniendo usuarios inactivos');
            try {
                const result = await users.getAll();
                
                // Obtener la fecha actual y restarle 30 minutos
                const currentTime = new Date();
                const halfHourAgo = new Date(currentTime.getTime() - 30 * 60000); // 30 minutos en milisegundos
    
                // Encontrar usuarios que no se han conectado en más de 30 minutos
                const inactiveUsers = result.filter(user => {
                    return new Date(user.last_connection) < halfHourAgo;
                });
                
                if (inactiveUsers.length === 0) {
                    req.logger.info("No se encontraron usuarios inactivos");
                    return response.successResponse(res, 200, "No se encontraron usuarios inactivos");
                }
    
                // Eliminar los usuarios inactivos de la base de datos
                inactiveUsers.forEach(async user => {
                    await userModel.deleteOne({ _id: user._id });
                    await sendInactiveAccountNotification(user.email, user.first_name);
                });
    
                req.logger.info('Usuarios inactivos eliminados correctamente');
                return response.successResponse(res, 200, "Usuarios inactivos eliminados correctamente");
            } catch (error) {
                req.logger.error("Error al eliminar usuarios inactivos");
                return response.errorResponse(res, 500, "Error al eliminar usuarios inactivos");
            }
        });
    }

    async deleteUser(req, res) {
        const { uid } = req.params; // Obtener el ID del usuario a eliminar
        addLogger(req, res, async () => {
            try {
                const user = await userModel.findById(uid);
                if (!user) {
                    return response.errorResponse(res, 404, 'Usuario no encontrado');
                }

                await userModel.deleteOne({ _id: uid });
                
                // Opcional: Realizar alguna acción adicional al eliminar el usuario

                return response.successResponse(res, 200, 'Usuario eliminado exitosamente');
            } catch (error) {
                return response.errorResponse(res, 500, 'Error al eliminar el usuario');
            }
        });
    }
}

export default  UserController;