FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the application files
COPY . .

# DB
## Generate Prisma client
RUN npx prisma generate

## Run Prisma migrations
RUN npx prisma migrate deploy

## Run Prisma seed
RUN npm run prisma:seed

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
