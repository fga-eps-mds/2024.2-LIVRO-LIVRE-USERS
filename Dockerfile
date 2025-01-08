# Use a lightweight Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port the app will listen on
EXPOSE 3000

# Define the command to start the app
CMD ["node", "dist/main.js"]