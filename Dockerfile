FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY /build /app/

CMD ["node", "."]
