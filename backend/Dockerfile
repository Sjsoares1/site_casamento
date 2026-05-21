FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm install

# Copia o restante dos arquivos do backend
COPY . .

EXPOSE 3000

CMD ["npm", "start"]