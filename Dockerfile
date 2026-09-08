# Deploy image for teman-undangan.
#
# Base images are glibc (bookworm-slim), not Alpine: `wrangler types` runs
# `workerd` to emit the runtime types, and workerd is not built for musl.
#
# The app runs on Cloudflare Workers, not in a container: this image carries the
# built OpenNext worker bundle plus a pinned wrangler, so a pipeline can ship an
# immutable, already-built artifact instead of rebuilding at deploy time.
#
#   docker run --rm -e CLOUDFLARE_API_TOKEN=... ghcr.io/<owner>/teman-undangan:<tag>

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

FROM deps AS build
WORKDIR /app
COPY . .
# `cloudflare-env.d.ts` is generated, never committed, and `next build`
# type-checks against it.
RUN npm run cf-typegen && npm run build:cf

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
# Keep in step with the wrangler devDependency in package.json.
ARG WRANGLER_VERSION=4.105.0
RUN npm install --global --no-fund --no-audit wrangler@${WRANGLER_VERSION}
COPY --from=build /app/.open-next ./.open-next
COPY --from=build /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=build /app/drizzle ./drizzle
ENTRYPOINT ["wrangler"]
CMD ["deploy"]
