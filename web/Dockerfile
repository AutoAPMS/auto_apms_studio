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
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV AUTO_APMS_STUDIO_BACKEND_PORT=8000
EXPOSE 80
