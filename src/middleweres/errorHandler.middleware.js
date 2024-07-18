// @ts-nocheck
import { addLogger } from "../utils/logger.js";

export const errorHandler = (error, req, res, next) => {
    addLogger(req, res, () => {
        if (error) {
            if (error.code) {
                req.logger.error(`${error.name}: ${error.description}`);
                res.setHeader("Content-Type", "application/json");
                return res.status(error.code).json({ error: error.message });
            } else {
                req.logger.error('Unexpected error');
                res.setHeader("Content-Type", "application/json");
                return res.status(500).json({ error });
            }
        }
    
        next();
    });
};