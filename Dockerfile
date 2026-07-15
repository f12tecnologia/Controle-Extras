# ---- Build do frontend ----
FROM node:20-alpine AS build

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
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.js loadEnv.js ./
COPY --from=build /app/dist ./dist

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "server.js"]
