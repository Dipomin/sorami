# Dockerfile pour Sorami Frontend (optionnel - alternative au déploiement PM2)

# Stage 1: Dépendances
FROM node:20-alpine AS deps
WORKDIR /app

# Installer les dépendances du système pour Prisma
RUN apk add --no-cache libc6-compat openssl

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les dépendances depuis l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Générer le client Prisma
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Changer le propriétaire
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
