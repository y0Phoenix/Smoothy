FROM node

WORKDIR /app

COPY /build/package*.json ./

RUN npm install

COPY /build /app/

CMD ["node", "."]
