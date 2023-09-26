FROM node:16-slim

WORKDIR /app

RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci \
 && npm cache clean --force \
 && mv /app/node_modules /node_modules

COPY ./src .

ENV PORT 80

EXPOSE 80

CMD [ "npm", "start" ]