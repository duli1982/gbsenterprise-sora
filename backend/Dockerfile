# Build stage: install dependencies and compile TypeScript
FROM node:18 AS build
WORKDIR /app

# Install dependencies using npm ci for reproducible builds
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and build the application
COPY src ./src
RUN npm run build

# Production stage: run the compiled application with production deps
FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
