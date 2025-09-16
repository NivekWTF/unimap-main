# -------- Build stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Copia sólo manifiestos para cache de dependencias
COPY package.json package-lock.json ./
# Si NO tienes package-lock.json, usa 'npm install' en vez de 'npm ci'
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia el resto del código
COPY . .
ARG VITE_TRPC_BASE_URL
ARG VITE_TILES_URL
ARG VITE_CENTRO_DEFAULT_MAPA
ARG VITE_GEOJSON_PATH
ENV VITE_TRPC_BASE_URL=$VITE_TRPC_BASE_URL
ENV VITE_TILES_URL=$VITE_TILES_URL
ENV VITE_CENTRO_DEFAULT_MAPA=$VITE_CENTRO_DEFAULT_MAPA
ENV VITE_GEOJSON_PATH=$VITE_GEOJSON_PATH
RUN npm run build

# -------- Runtime (Nginx) --------
FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
