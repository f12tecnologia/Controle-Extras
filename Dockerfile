# ---- Build do frontend ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY vite.config.js postcss.config.js tailwind.config.js ./
COPY src ./src
COPY plugins ./plugins
COPY tools ./tools

RUN npm run build

# ---- Runtime (API + frontend estático) ----
FROM node:22-alpine AS runtime

WORKDIR /app

# NODE_ENV só depois do install — evita conflito com npm ci --omit=dev
ENV PORT=5000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
  && npm cache clean --force

COPY server.js loadEnv.js ./
COPY create-superadmin.js ./
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "server.js"]
