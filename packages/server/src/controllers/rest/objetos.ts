import { Router } from 'express';

import { Objeto, objetoValidator } from '../../models';
import { multerDisco } from '../../middlewares';

const objetos = Router();

objetos.post('/', multerDisco.array('archivosImagenes'), async (req, res, next) => {
  try {
    let objeto;

    try {
      req.body.geometria = JSON.parse(req.body.geometria);
      req.body.servicios = JSON.parse(req.body.servicios || '[]');
      req.body.archivosImagenes = JSON.parse(req.body.archivosImagenes || '[]');
      req.body.imagenes = JSON.parse(req.body.imagenes || '[]');

      objeto = objetoValidator.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ status: false, message: error.message });
    }
    
    const { campus: institucion, qgisId } = objeto;
    const esRepetido = await Objeto.findOne({
      campus: institucion,
      qgisId,
      activo: true,
    });

    if (esRepetido) {
      return res.status(400).json({
        status: false,
        message: 'El objeto ya existe dentro de la institución',
      });
    }

    const archivosImagenes = req.files as Express.Multer.File[];
    if (archivosImagenes) {
      const { imagenes = [] } = objeto;
      objeto.imagenes = [...imagenes, ...archivosImagenes.map(({ path }) => path)];
    }

    objeto.usuarioCreacion = res.locals.session._id;

    const objetoBd = await Objeto.create(objeto);

    return res.status(201).json(objetoBd);
  } catch (error) {
    return next(error);
  }
});

objetos.put('/:id', multerDisco.array('archivosImagenes'), async (req, res, next) => {
  try {
    let objeto;

    try {
      req.body.geometria = JSON.parse(req.body.geometria);
      req.body.servicios = JSON.parse(req.body.servicios || '[]');
      req.body.archivosImagenes = JSON.parse(req.body.archivosImagenes || '[]'); 
      req.body.imagenes = JSON.parse(req.body.imagenes || '[]');

      objeto = objetoValidator.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ status: false, message: error.message });
    }
    
    const { id } = req.params;

    const archivosImagenes = req.files as Express.Multer.File[];

    if (archivosImagenes) {
      const { imagenes = [] } = objeto;
      objeto.imagenes = [...imagenes, ...archivosImagenes.map(({ path }) => path)];
    }


    objeto.usuarioModificacion = res.locals.session._id;
    objeto.fechaModificacion = new Date();
    
    const objetoBd = await Objeto.findByIdAndUpdate(id, objeto, {
      new: true,
    });

    return res.status(200).json(objetoBd);
  } catch (error) {
    return next(error);
  }
});

export default objetos