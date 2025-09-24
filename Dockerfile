# Usa Node.js LTS (estável)
FROM node:20

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install --omit=dev

# Copia o restante dos arquivos
COPY . .

# Expoe a porta usada no server.js
EXPOSE 8080

# Comando padrão para rodar
CMD ["node", "server.js"]