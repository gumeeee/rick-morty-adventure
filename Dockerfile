FROM node:20-alpine

LABEL maintainer="Rick and Morty Dashboard"
LABEL description="Homologação Angular app com Docker"
LABEL version="1.0"

RUN apk add --no-cache git
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
  npm cache clean --force

COPY . .

RUN npm run build -- --configuration production

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200/ || exit 1

RUN npm install -g http-server

CMD ["http-server", "dist/rick-morty-adventure/browser", "-p", "4200", "-c-1", "--proxy", "http://localhost:4200?"]
