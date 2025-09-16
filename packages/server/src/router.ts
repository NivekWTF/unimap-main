import fs from "fs";
import express, { Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { createContext, router } from "./config/trpc";

import {
  manejarErrorRest,
  manejarErrorTrpc,
} from "./middlewares/manejar-errores";
import { configurarServidorExpress } from "./config/express";

import { validarToken } from "./middlewares/validar-token";

// TRPC Controllers
import * as busqueda from "./controllers/trpc/busqueda";
import * as campus from "./controllers/trpc/campus";
import * as categorias from "./controllers/trpc/categorias";
import * as clases from "./controllers/trpc/clases";
import * as importarObjetos from "./controllers/trpc/importar-objetos";
import * as objetos from "./controllers/trpc/objetos";
import * as servicios from "./controllers/trpc/servicios";
import * as sesiones from "./controllers/trpc/sesiones";
import * as usuarios from "./controllers/trpc/usuarios";
import * as geojson from "./controllers/trpc/geojson";

// Rest Controllers
import restImportador from "./controllers/rest/importador";
import restObjetos from "./controllers/rest/objetos";

import { Carpetas } from "./constants/carpetas";

const trpcPrefix = "/api/v1/trpc/";
const restPrefix = "/api/v1/";

const restEndpoint = (uri: string) => `${restPrefix}${uri}`;

function createTRPCRouter() {
  return router({
    campus: router(campus),
    categorias: router(categorias),
    importarObjetos: router(importarObjetos),
    objetos: router(objetos),
    servicios: router(servicios),
    sesiones: router(sesiones),
    usuarios: router(usuarios),
    busqueda: router(busqueda),
    clases: router(clases),
    geojson: router(geojson),
  });
}

export function createAppRouter(app: Express) {
  configurarServidorExpress(app);

  // TRPC
  const trpcRouter = createTRPCRouter();

  if (!fs.existsSync(Carpetas.Publica)) {
    fs.mkdirSync(Carpetas.Publica);
  }
  app.use(`/${Carpetas.Publica}`, express.static(Carpetas.Publica));

  app.use(
    trpcPrefix,
    createExpressMiddleware({
      maxBodySize: 250,
      router: trpcRouter,
      onError: manejarErrorTrpc,
      createContext,
    }),
  );

  app.use(validarToken);
  app.use(restEndpoint("importador"), restImportador);
  app.use(restEndpoint("objetos"), restObjetos);

  app.use("*", (_, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
  });

  app.use(manejarErrorRest);

  return trpcRouter;
}
