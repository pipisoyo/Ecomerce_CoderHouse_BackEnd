import { Router } from "express";
import passport from "passport";
import { auth } from "../config/auth.js";
import sessionController from "../controllers/sessionControler.js";
const sessionsRouter = Router();

/**
 * Ruta para cerrar sesión.
 * @name POST /logout
 * @function
 */
sessionsRouter.post('/logout', sessionController.logout);

/**
 * Ruta para registrar un usuario.
 * @name POST /register
 * @function
 */
sessionsRouter.post("/register", passport.authenticate("register", { failureRedirect: "/failregister" }), sessionController.register);

/**
 * Ruta para manejar el fallo en el registro.
 * @name GET /failregister
 * @function
 */
sessionsRouter.get("/failregister", sessionController.failRegister);

/**
 * Ruta para iniciar sesión.
 * @name POST /login
 * @function
 */
sessionsRouter.post('/login', passport.authenticate('login', { failureRedirect: "/faillogin" }), sessionController.login);

/**
 * Ruta para manejar el fallo en el inicio de sesión.
 * @name GET /faillogin
 * @function
 */
sessionsRouter.get("/faillogin", sessionController.failLogin);

/**
 * Ruta para iniciar sesión con GitHub.
 * @name GET /github
 * @function
 */
sessionsRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }), sessionController.githubLogin);

/**
 * Ruta de callback para la autenticación con GitHub.
 * @name GET /githubcallback
 * @function
 */
sessionsRouter.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), sessionController.githubCallback);

/**
 * Ruta para restablecer la contraseña.
 * @name POST /restore/:token
 * @function
 */
sessionsRouter.post("/restore/:token", sessionController.restorePassword);

/**
 * Ruta para enviar correo de restauración de contraseña.
 * @name POST /mailRestore
 * @function
 */
sessionsRouter.post("/mailRestore", sessionController.mailRestore);

/**
 * Ruta para obtener el usuario actual.
 * @name GET /current
 * @function
 */
sessionsRouter.get('/current', auth, sessionController.getCurrentUser);

/**
 * Ruta para cambiar a rol premium.
 * @name PUT /premium/:uid
 * @function
 */


/**
 * Exporta los enrutadores de las rutas Sessions.
 * @module sessionsRouter
 */
export default sessionsRouter;