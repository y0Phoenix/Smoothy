FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY /build /app/

COPY /config /app/

ENV DOCKER_BUILD=true

CMD ["node", "."]
