FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Указываем порт
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]
