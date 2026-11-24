FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Copy the workspace manifests first: the dependency layer is then cached
# independently of the source, so editing code does not reinstall anything.
# npm needs every workspace package.json because the lockfile describes them all.
COPY package.json package-lock.json ./
COPY src/backend/package.json src/backend/
COPY src/frontend/package.json src/frontend/

# Only the backend workspace, production dependencies only.
RUN npm ci --omit=dev --workspace src/backend

COPY src/backend ./src/backend

WORKDIR /app/src/backend

# Upload target. In compose this is covered by a named volume; the directory
# still has to exist for a plain `docker run`.
RUN mkdir -p uploads

EXPOSE 8810

CMD ["node", "server.js"]
