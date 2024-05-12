FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
COPY ./scripts /app/scripts
WORKDIR /app

FROM base as prod-deps
RUN apk add --no-cache python3 make g++
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN apk add --no-cache python3 make g++
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run compile

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/scripts /app/scripts

RUN chmod +x /app/scripts/*.sh

ENTRYPOINT ["pnpm", "start"]