FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown nodejs:nodejs /app

USER nodejs

RUN mkdir -p src/generated

COPY --chown=nodejs:nodejs package.json package-lock.json ./
RUN npm ci

COPY --chown=nodejs:nodejs . .

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]