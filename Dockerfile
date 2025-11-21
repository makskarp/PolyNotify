# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL and CA certificates (required for Prisma & SSL connections)
RUN apk add --no-cache openssl ca-certificates

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
# Start the bot (push schema to DB first)
CMD ["sh", "-c", "npx prisma db push && npm start"]
