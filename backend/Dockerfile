# Use the official Playwright image with all dependencies pre-installed
FROM mcr.microsoft.com/playwright:focal

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy rest of the project files
COPY . .

# Expose port your app listens on (change if not 3000)
EXPOSE 3000

# Start your app
CMD ["npm", "start"]
