FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p database_store backup_files user_projects extensions exports

EXPOSE 3000

CMD ["node", "4_PROCESSING_SERVER/server.js"]
