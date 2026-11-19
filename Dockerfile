FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=3001 DEMO_DATA_FILE=/app/data/sunhost-demo-data.json
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json schema.sql ./
RUN mkdir /app/data && chown node:node /app/data
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
