# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json .
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
