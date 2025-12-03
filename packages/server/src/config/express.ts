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
  // PNA-aware CORS preflight handler: must run before the cors middleware
  app.use((req, res, next) => {
    const origin = (req.headers.origin as string) || '*';

    // Allow the requesting origin (safer than wildcard when private-network requests occur)
    if (origin && origin !== '*') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // If this is a preflight and the browser signals it will make a private-network request,
    // respond with the header that allows the PNA request to proceed.
    if (req.method === 'OPTIONS') {
      if (req.headers['access-control-request-private-network'] === 'true') {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
      }
      return res.sendStatus(204);
    }

    next();
  });
  app.use(helmetConfig);
  app.use(rateLimitConfig);
  app.use(corsConfig);
  app.use(compression());
};
