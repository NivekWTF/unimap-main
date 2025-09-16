import { Model, FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

const obtenerLimitYSkip = (pagina: any, itemsPorPagina: any) => ({
  skip: (Number(pagina) - 1) * Number(itemsPorPagina),
  limit: Number(itemsPorPagina),
});

const calcularTotalPaginas = (count: number, itemsPorPagina: any) =>
  Math.ceil(count / Number(itemsPorPagina));

export async function paginar<T>(
  model: Model<T>,
  {
    query,
    projection,
    options,
    pagina,
    limite,
  }: { 
    query: FilterQuery<T>; 
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
    pagina: number; 
    limite: number 
  }
) {
  const { skip, limit } = obtenerLimitYSkip(pagina, limite);

  const [registros, total] = await Promise.all([
    model.find(query, projection, options).skip(skip).limit(limit).lean(),
    model.countDocuments(query),
  ]);

  const totalPaginas = calcularTotalPaginas(total, limite);

  return {
    registros,
    total,
    totalPaginas,
  };
}
