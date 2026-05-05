# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/auto_apms_studio
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
