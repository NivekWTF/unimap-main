db = db.getSiblingDB('unimap');

db.createUser({
  user: 'unimap',
  pwd: 'unimap',
  roles: [
    {
      role: 'readWrite',
      db: 'unimap'
    },
  ],
});


db.usuarios.insertOne({
  username: 'admin',
  password: '$2a$10$JCIRCvCOBU4cerw2TLYV.eqb01PYilkqnPF01JPNoRjg0O5majGve',
  nombre: 'Admin',
  apellidos: 'Admin',
  tipoUsuario: 'ADMIN',
  activo: true,
  fechaCreacion: '2024-02-25T04:16:26.686Z',
  fechaModificacion: '2024-02-25T04:16:26.686Z',
});

const categorias = [{
  "_id": "edificios",
  "nombre": "Edificios",
  "descripcion": "",
  "palabrasClave": "",
  "icono": "apartment",
  "activo": true,
  "habilitado": true,
  "color": "#87CEEB",
  "colorSecundario": "#4682B4"
},
{
  "_id": "aulas",
  "nombre": "Aulas",
  "descripcion": "",
  "palabrasClave": "",
  "pertenece": [
    "edificios"
  ],
  "icono": "class",
  "activo": true,
  "habilitado": true,
  "color": "#98FB98",
  "colorSecundario": "#3CB371"
},
{
  "_id": "laboratorios",
  "nombre": "Laboratorios",
  "descripcion": "",
  "palabrasClave": "",
  "icono": "science",
  "pertenece": [
    "edificios"
  ],
  "activo": true,
  "habilitado": true,
  "color": "#FFFF00",
  "colorSecundario": "#FFD700"
},
{
  "_id": "administracion",
  "nombre": "Administración",
  "descripcion": "",
  "palabrasClave": "",
  "pertenece": [
    "edificios"
  ],
  "icono": "article",
  "activo": true,
  "habilitado": true,
  "color": "#FFA500",
  "colorSecundario": "#FF8C00"
},
{
  "_id": "sanitarios",
  "nombre": "Sanitarios",
  "descripcion": "",
  "palabrasClave": "",
  "icono": "wc",
  "pertenece": [
    "edificios",
    "auditorios",
    "zonas-deportivas"
  ],
  "activo": true,
  "habilitado": true,
  "color": "#D3D3D3",
  "colorSecundario": "#A9A9A9"
},
{
  "_id": "bibliotecas",
  "nombre": "Bibliotecas",
  "descripcion": "",
  "palabrasClave": "",
  "pertenece": [
    "edificios"
  ],
  "icono": "local_library",
  "activo": true,
  "habilitado": true,
  "color": "#D2B48C",
  "colorSecundario": "#CD853F"
},
{
  "_id": "atencion",
  "nombre": "Atención",
  "descripcion": "",
  "palabrasClave": "",
  "pertenece": [
    "edificios"
  ],
  "icono": "health_and_safety",
  "activo": true,
  "habilitado": true,
  "color": "#FF0000",
  "colorSecundario": "#CD5C5C"
},
{
  "_id": "zonas-deportivas",
  "nombre": "Zonas Deportivas",
  "descripcion": "",
  "palabrasClave": "",
  "icono": "sports",
  "activo": true,
  "habilitado": true,
  "color": "#006400",
  "colorSecundario": "#228B22"
},
{
  "_id": "auditorios",
  "nombre": "Auditorios",
  "descripcion": "",
  "palabrasClave": "",
  "icono": "stadium",
  "activo": true,
  "habilitado": true,
  "color": "#800080",
  "colorSecundario": "#9400D3"
}];

db.categorias.insertMany(categorias);