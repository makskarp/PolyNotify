# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for ts-node)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Start the bot
CMD ["npm", "start"]
