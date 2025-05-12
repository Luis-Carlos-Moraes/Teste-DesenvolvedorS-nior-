# Dockerfile
FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependências
RUN npm install

COPY . .

# RUN npm run build

EXPOSE 3333

# Comando para rodar a aplicação
CMD ["npm", "run", "dev"]