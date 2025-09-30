# ---------- Build stage ----------
FROM node:20-slim AS builder

# Instala pnpm apenas no builder
RUN npm install -g pnpm@9

WORKDIR /app

# Copia manifestos primeiro (melhora cache)
COPY package.json pnpm-lock.yaml ./

# Instala todas dependências (prod + dev)
RUN pnpm install --frozen-lockfile

# Copia o restante do código-fonte
COPY . .

# Build da aplicação (gera /dist)
RUN pnpm run build

# Remove devDependencies para produção
RUN pnpm prune --prod

# ---------- Runtime / produção ----------
FROM node:20-slim AS production

RUN npm install -g pnpm@9

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nestjs

WORKDIR /app

# Copia apenas o necessário do builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/src/@shared/views ./src/@shared/views
COPY --from=builder --chown=nestjs:nodejs /app/src/@assets ./dist/@assets

# Configura logs e permissões
RUN mkdir -p /app/logs \
    && chown -R nestjs:nodejs /app \
    && chmod -R 750 /app

USER nestjs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/api/v1/health', (res)=>process.exit(res.statusCode===200?0:1))"

# Inicia a aplicação
CMD ["pnpm", "start:prod"]
