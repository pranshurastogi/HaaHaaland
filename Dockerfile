FROM node:24-bookworm-slim AS builder
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/archetypes/package.json packages/archetypes/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/archetypes packages/archetypes
COPY packages/tsconfig packages/tsconfig
RUN pnpm --filter @haahaaland/api build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
RUN groupadd --system haahaaland && useradd --system --gid haahaaland --home-dir /repo haahaaland
COPY --from=builder --chown=haahaaland:haahaaland /repo/node_modules ./node_modules
COPY --from=builder --chown=haahaaland:haahaaland /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=haahaaland:haahaaland /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=haahaaland:haahaaland /repo/apps/api/dist ./apps/api/dist
USER haahaaland
EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
