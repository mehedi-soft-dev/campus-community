# Build the SPA, then serve the static output from nginx. nginx also proxies
# /api and /uploads to the API container, so the browser only ever talks to one
# origin and the httpOnly auth cookie works without any CORS setup.

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY src/backend/package.json src/backend/
COPY src/frontend/package.json src/frontend/

# Dev dependencies are needed here (vite, sass, the React plugin).
RUN npm ci --workspace src/frontend

COPY src/frontend ./src/frontend

# Vite's publicDir points at the repository-root public/ folder, which holds the
# university logo and campus photo. It must be present at build time.
COPY public ./public

RUN npm run build --workspace src/frontend


FROM nginx:1.27-alpine

COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/src/frontend/dist /usr/share/nginx/html

EXPOSE 5183
