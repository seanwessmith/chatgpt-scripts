# syntax=docker/dockerfile:1

# Use bun-supported base image
FROM oven/bun:alpine as base

# Set working directory
WORKDIR /app

# Set environment variable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies
FROM base as deps
COPY package.json bun.lockb ./
RUN bun install

# Build the Next.js application
FROM deps as build
COPY . .
RUN bun run build:docker

# Prepare the final image
FROM base as final

# Adjust permissions to ensure the bun user can access the work directory
# This step is crucial before switching to a non-root user
RUN mkdir -p /app && \
    chown -R bun:bun /app

# Use a non-root user for security
# USER bun

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy build artifacts and node modules from the 'build' stage
COPY --from=build /app/ ./

# Copy over .env file
COPY .env ./

# Expose the default Next.js port and an additional one
EXPOSE 8080

# Start the Next.js application
CMD ["bun", "run", "./dist/ai-art-historian.js"]
