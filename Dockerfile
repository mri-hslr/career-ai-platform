# ==========================================
# Stage 1: Build the React Application
# ==========================================
# Use a lightweight Node Alpine image
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies FIRST (for Docker caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your frontend code
COPY . .

# Build the project (Vite outputs to the /dist folder)
RUN npm run build

# ==========================================
# Stage 2: Serve the App with Nginx
# ==========================================
# Use the official Nginx Alpine image
FROM nginx:alpine

# Copy the static files from the build stage to Nginx's serving folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (the default HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]