# Dev image for Next.js with full dependencies.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000
CMD ["npm","run","dev","--","-p","8000"]
