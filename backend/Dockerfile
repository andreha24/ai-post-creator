FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown nodejs:nodejs /app

USER nodejs

COPY --chown=nodejs:nodejs package.json package-lock.json ./
RUN npm install

COPY --chown=nodejs:nodejs . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]