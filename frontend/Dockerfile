# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage — copy built files to a shared volume
FROM alpine:latest
COPY --from=build /app/dist /dist
CMD ["sh", "-c", "find /output -mindepth 1 -maxdepth 1 -exec rm -rf {} + && cp -r /dist/. /output/"]
