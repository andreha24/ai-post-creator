FROM node:24-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

RUN chown nextjs:nodejs /app

USER nextjs

RUN mkdir -p .next

COPY --chown=nextjs:nodejs package.json package-lock.json ./
RUN npm ci

COPY --chown=nextjs:nodejs . .

CMD ["npm", "run", "dev"]

# For production: remove volume mounts from compose and switch to:
# RUN npm run build
# CMD ["npm", "start"]
