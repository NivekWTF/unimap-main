FROM mongo:latest

WORKDIR /usr/src/app

COPY init-script.js /docker-entrypoint-initdb.d/

EXPOSE 27017

CMD ["mongod"]
