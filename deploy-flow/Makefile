COMPOSE = docker compose -f ./docker-compose.yml

APP_CONTAINER = nest-app
APP_PORT = 3333
ENV_FILE_ROOT = ../.env
ENV_FILE_DEPLOY = ./.env

# Build + deploy
up:
	@echo "=== Copiando .env da raiz para deploy-flow ==="
	cp -f $(ENV_FILE_ROOT) $(ENV_FILE_DEPLOY)
	@echo "=== Down antigo e remove órfãos ==="
	$(COMPOSE) down --remove-orphans
	@echo "=== Build sem cache ==="
	$(COMPOSE) build --no-cache
	@echo "=== Subindo containers ==="
	$(COMPOSE) up -d
	@echo "=== Aguardando Postgres estar pronto... ==="
	$(COMPOSE) exec -T db bash -c 'until pg_isready -h db -U $$DATABASE_USER -d $$DATABASE_DB_NAME; do echo "Esperando Postgres..."; sleep 2; done'
	@echo "=== Rodando migrations ==="
	$(COMPOSE) run --rm app pnpm run migration:run:prod
	@echo "=== Deploy concluído ==="
	@echo "=== Limpando imagens não usadas do projeto ==="
	docker image prune -f --filter "label=project=nest-app"

# Rollback para a imagem anterior já tagueada
rollback:
	@echo "=== Rollback para imagem anterior ==="
	-docker stop $(APP_CONTAINER)
	-docker rm $(APP_CONTAINER)
	docker run -d --name $(APP_CONTAINER) \
		--env-file $(ENV_FILE_DEPLOY) \
		-p $(APP_PORT):$(APP_PORT) \
		nest-app:previous
	@echo "=== Rollback concluído ==="

logs:
	$(COMPOSE) logs -f app

down:
	$(COMPOSE) down
