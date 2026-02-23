# Stage 0, "build-stage", based on Bun, to build and compile the backoffice
FROM public.ecr.aws/docker/library/node:20-alpine AS build-stage
RUN npm install -g bun

WORKDIR /app

COPY package.json bun.lock /app/

COPY backoffice/package.json /app/backoffice/
COPY portal/package.json /app/portal/
COPY packages/api-client/package.json /app/packages/api-client/
COPY packages/utils/package.json /app/packages/utils/

RUN bun install --frozen-lockfile

COPY ./packages /app/packages
COPY ./backoffice /app/backoffice

WORKDIR /app/backoffice
ARG VITE_API_URL

# Use node directly — bun run segfaults on Alpine/musl.
# tsc and vite both use #!/usr/bin/env node, so they run under node, not bun.
ENV PATH="/app/node_modules/.bin:${PATH}"
RUN tsc -p tsconfig.build.json && vite build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM public.ecr.aws/docker/library/nginx:1.28-alpine

COPY --from=build-stage /app/backoffice/dist/ /usr/share/nginx/html

COPY ./backoffice/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./backoffice/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
