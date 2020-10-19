FROM node:alpine

RUN apk add --update bash && rm -f /var/cache/apk/*

WORKDIR /code

COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm ci &> /dev/null

COPY . /code/

RUN npm run build

ENTRYPOINT [ "npm", "start" ]