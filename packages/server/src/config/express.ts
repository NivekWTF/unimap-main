import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { Express, json } from "express";
import { rateLimit } from "express-rate-limit";

const helmetConfig = helmet({
  strictTransportSecurity: {
    // HSTS
    maxAge: 31536000, // 1 año
    includeSubDomains: false,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
});

const corsConfig = cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 500, // 100 peticiones por IP durante la duración de la ventana
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

/**
 * Función que establece las configuraciones de middlewares para
 * el servidor
 */
export const configurarServidorExpress = (app: Express) => {
  app.use(json());
  app.use(helmetConfig);
  app.use(rateLimitConfig);
  app.use(corsConfig);
  app.use(compression());
};
