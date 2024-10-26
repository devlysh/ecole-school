# Base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install Prisma CLI, dotenv-cli, and tsx globally
RUN npm install -g prisma dotenv-cli tsx

# Set environment to production
ENV NODE_ENV production

# Copy the application files, excluding .env files
COPY . .
COPY .env.production .env

# Remove any local .env files that might have been copied
RUN rm -f .env.local .env.development .env.develop .env.dev

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build:prod

# Expose the application port
EXPOSE 3000

# Command to run migrations, seed, sync with Stripe, and start the app
# Start of Selection
CMD ["sh", "-c", "npx prisma migrate deploy && \
    npx dotenv -e .env -- tsx prisma/seed.ts && \
    npx dotenv -e .env -- tsx prisma/seed-admin.ts && \
    npx dotenv -e .env -- tsx scripts/sync-stripe-plans.ts && \
    npx dotenv -e .env -- tsx scripts/sync-stripe-customers.ts && \
    npx dotenv -e .env -- npm start"]
# End of Selection
