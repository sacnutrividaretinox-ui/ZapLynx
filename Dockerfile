# Usar Node 18 como base
FROM node:18-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração primeiro
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o restante do código
COPY . .

# Expor a porta usada pelo Railway
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]