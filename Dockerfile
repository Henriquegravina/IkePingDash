FROM node:20.10.0-alpine
 
WORKDIR /app
 
COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm install

COPY . .

RUN apk add iputils
RUN apk add bash


CMD [ "node", "IkePingDash.js" ]