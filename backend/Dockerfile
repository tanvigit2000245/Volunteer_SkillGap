# Production Dockerfile for Volunteer Skill-Gap Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install production dependencies first (enables caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "app.js"]

