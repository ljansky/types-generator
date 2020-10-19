FROM node:alpine

ENV KUBE_LATEST_VERSION="v1.19.2"

RUN apk add --no-cache ca-certificates bash git openssh-client openssh curl \
    && wget -q https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -O /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kubectl \
    && chmod g+rwx /root \
    && mkdir /config \
    && chmod g+rwx /config

WORKDIR /code

COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm ci &> /dev/null

COPY . /code/

RUN npm run build

WORKDIR /config

CMD ["sh"]