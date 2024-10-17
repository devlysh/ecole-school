# Base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install Prisma CLI, dotenv-cli, and tsx globally
RUN npm install -g prisma dotenv-cli tsx

# Set the environment to production
ENV NODE_ENV=production

# Copy environment variables for production
COPY .env.production .env

# Copy the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run migrations, seed, sync with Stripe, and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npx dotenv -e .env -- tsx prisma/seed.ts && npx dotenv -e .env -- tsx scripts/sync-stripe-plans.ts && npx dotenv -e .env -- npm start"]
