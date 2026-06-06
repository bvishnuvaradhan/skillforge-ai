FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src/ ./src
COPY tools/ ./tools
COPY .env.example ./

EXPOSE 5000

CMD ["npm", "start"]
