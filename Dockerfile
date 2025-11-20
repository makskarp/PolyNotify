# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use --omit=dev for production to skip devDependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
# We need dev dependencies to build, so actually we should install all deps first
# Let's adjust: install all, build, then prune
RUN npm ci && npm run build && npm prune --production

# Start the bot
CMD ["npm", "start"]
