import axios from '../config/axios';

import { OBJETOS, endpoint } from '../constant/uris';

const headers = {
  'Content-Type': 'multipart/form-data',
};

export const upsertObjeto = (objeto: FormData, id?: number | string) =>
  id
    ? axios.put(endpoint(OBJETOS, id), objeto, { headers })
    : axios.post(OBJETOS, objeto, { headers });
