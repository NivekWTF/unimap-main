import { z } from 'zod';
import { Schema } from 'mongoose';

import { geometriaValidator } from '../utilities/validators';

export type TGeometria = z.infer<typeof geometriaValidator>;

export const geometria = new Schema<TGeometria>(
  {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: [[[[Number, Number]]]],
      required: true,
    },
  },
  { _id: false }
);
