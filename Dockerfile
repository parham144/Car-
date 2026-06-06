# Use Node.js 20 lightweight Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install all development and production dependencies (needed for compilation)
RUN npm ci

# Copy the rest of the workspace files
COPY . .

# Build the client spa and compile server.ts to dist/server.cjs
RUN npm run build

# Clear development dependencies and keep only production node modules to keep image slim
RUN rm -rf node_modules && npm ci --omit=dev

# Expose port 3000 (which is the default port the backend listens on)
EXPOSE 3000

# Set Node environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Run the compiled application
CMD ["npm", "start"]
