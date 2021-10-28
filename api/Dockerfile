FROM node:14 AS base
WORKDIR /app
COPY package.json .

# ---- dependencies ----
FROM base AS dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm install

# ---- tsc compile ----
FROM dependencies AS tsc
COPY . .
RUN /app/node_modules/typescript/bin/tsc
RUN rm -rf /app/node_modules
RUN npm install --only=production

# ---- release ----
FROM node:14-slim AS release
COPY --from=tsc /app/node_modules /app/node_modules
COPY --from=tsc /app/.bin/ /app

ENTRYPOINT [ "node", "/app/index.js" ]

