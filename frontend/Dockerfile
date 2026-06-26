# Stage 1: Build
FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_BACKEND_PUBLIC_URL
ARG VITE_MOODLE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_PUBLIC_URL=$VITE_BACKEND_PUBLIC_URL
ENV VITE_MOODLE_URL=$VITE_MOODLE_URL

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npx quasar prepare && npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-bookworm

COPY --from=builder /app/dist/spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
