import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import config from "../config.js";

const DB_URL = config.mongo_url;

/**
 * Aplicación Express para el servidor web.
 */
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesión MongoDB (Base de Datos)
app.use(session({
  store: new MongoStore({
    mongoUrl: DB_URL,
    ttl: 3600
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

export default app;