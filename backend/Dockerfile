# Multi-stage Dockerfile for building and running the backend
# Build stage: install dependencies and compile TypeScript
FROM node:18 AS build
WORKDIR /app

# Install dependencies with npm ci for reproducible builds
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and build the app
COPY src ./src
RUN npm run build

# Remove dev dependencies to prepare prod node_modules
RUN npm prune --production

# Runtime stage
FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy production node_modules and compiled output from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
