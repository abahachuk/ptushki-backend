FROM node:12-alpine

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . /app

EXPOSE 3001

CMD ["npm", "start"]
