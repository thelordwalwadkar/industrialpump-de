# Stage 1: build the static site (runs the schema/link/SEO checks as part of `npm run build`)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public test deployments are noindex by default. For production pass: --build-arg PUBLIC_STAGING=0 --build-arg PUBLIC_SITE_URL=https://www.industrialpump.de
ARG PUBLIC_SITE_URL=""
ARG PUBLIC_STAGING="1"
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL PUBLIC_STAGING=$PUBLIC_STAGING
RUN npm run build

# Stage 2: serve it (unprivileged nginx, port 8080)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/robots.txt >/dev/null || exit 1
