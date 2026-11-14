FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p /app/public/uploads /app/uploads/tmp && chown -R node:node /app/public /app/uploads
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
