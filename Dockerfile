FROM node:20-alpine

WORKDIR /app

# Copiamos solo lo necesario del backend
COPY backend/package*.json ./

RUN npm install --omit=dev

COPY backend/ .

EXPOSE 4000

ENV NODE_ENV=production

CMD ["npm", "start"]
