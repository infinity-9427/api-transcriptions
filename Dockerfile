# # Stage 1: Install Dependencies
# FROM node:20-alpine AS deps

# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package.json package-lock.json ./
# RUN npm install --only=production

# # Stage 2: Build the Application
# FROM node:20-alpine AS builder

# WORKDIR /app

# # Copy dependencies from previous stage
# COPY --from=deps /app/node_modules ./node_modules

# # Copy everything else
# COPY . .

# # Stage 3: Run in Production
# FROM node:20-alpine

# WORKDIR /app

# # Ensure directories exist before copying
# RUN mkdir -p /app/node_modules /app/src /app/prisma

# COPY --from=builder /app/node_modules /app/node_modules/
# COPY --from=builder /app/src /app/src/
# COPY --from=builder /app/prisma /app/prisma/
# COPY --from=builder /app/package.json /app/
# COPY --from=builder /app/.env /app/  
# EXPOSE 5000

# ENV NODE_ENV=production

# # Run Prisma Migrations before starting
# CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]



# Stage 1: Install Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
RUN npm install --only=production

# Stage 2: Build the Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy everything else
COPY . .

# Stage 3: Run in Production
FROM node:20-alpine

WORKDIR /app

# Ensure directories exist before copying
RUN mkdir -p /app/node_modules /app/src /app/prisma

COPY --from=builder /app/node_modules /app/node_modules/
COPY --from=builder /app/src /app/src/
COPY --from=builder /app/prisma /app/prisma/
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/.env /app/  
EXPOSE 5000

ENV NODE_ENV=production

# Run Prisma Migrations before starting
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
