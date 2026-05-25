FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Сразу выдать права на рабочую папку
RUN chown nextjs:nodejs /app

USER nextjs

COPY --chown=nextjs:nodejs package.json package-lock.json ./
RUN npm install

COPY --chown=nextjs:nodejs . .

RUN npm run build

CMD ["npm", "run", "dev"]

# CMD ["npm", "start"] - for prod
