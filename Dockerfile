FROM node:14.15.1-alpine as builder

WORKDIR /app
COPY . ./
RUN npm install && npm run build

FROM node:14.15.1-alpine

WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENTRYPOINT ["npm", "start"]