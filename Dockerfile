# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN npm ci || npm install

# Copy the rest
COPY . .

# Accept the Gemini API key as a build-arg for Vite (DO NOT hardcode)
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}

# Build the static site (Vite)
ENV NODE_ENV=production
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /srv

# Use a tiny static file server
RUN npm install -g serve

# Copy built assets
COPY --from=build /app/dist ./dist

# Cloud Run expects the server to listen on $PORT
ENV PORT=8080
EXPOSE 8080

# Serve the built app
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]