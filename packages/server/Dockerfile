FROM node:18

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

RUN npm i -g pnpm 

RUN pnpm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
