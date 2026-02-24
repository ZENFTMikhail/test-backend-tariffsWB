FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package*.json .

RUN npm install --omit=dev --legacy-peer-deps

FROM deps-prod AS build

RUN npm install --include=dev --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY ./credentials.json ./credentials.json
