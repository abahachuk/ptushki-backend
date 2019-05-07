FROM node:10.15.3-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci

COPY . /usr/src/app

RUN npm run build

RUN mkdir -p /usr/src/app/dist/src/logs

EXPOSE 8080

CMD ["npm", "start"]
