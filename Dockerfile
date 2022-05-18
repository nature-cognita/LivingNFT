FROM node:lts

WORKDIR /app

COPY ./ /app

RUN npm install

CMD node ./app.js
