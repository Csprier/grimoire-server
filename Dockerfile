FROM node:15.4.0

ENV PORT=8080 \
    NODE_ENV=development

WORKDIR /mnt/c/Users/cspri/Desktop/grimoire/grimoire-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]