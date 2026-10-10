FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the frontend (Vite) and backend (esbuild)
RUN npm run build

# Expose port 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start the production server
CMD ["npm", "start"]
