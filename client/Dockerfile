# Use an official Node.js image as the base
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Install dependencies (will be overwritten by volume, but needed for initial install)
COPY package*.json ./
RUN npm install

# Copy the rest of the app (will be overwritten by volume)
COPY . .

# Expose the port your dev server runs on (change if needed)
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "dev"]