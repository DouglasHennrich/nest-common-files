## 1. Secrets necessários (GitHub → Settings → Secrets and variables → Actions)

- **EC2_HOST** — IP/DNS do EC2
- **EC2_USER** — ex.: ubuntu
- **EC2_SSH_KEY** — conteúdo da chave privada (PEM)
- **EC2_REPO_DIR** — caminho do projeto no EC2 (ex.: /home/ubuntu/seu-projeto)
- **S3_BUCKET** — ex.: meu-bucket-prod
- **DISCORD_WEBHOOK_URL** — URL do webhook do Discord
- (Opcional) se não usar IAM Role no EC2: configure AWS CLI no EC2 com permissão de s3:PutObject.

## 2. Passos de primeiro uso (SSL)

1. Instale Certbot e configure Nginx no host EC2
2. O Nginx do host será responsável por emitir certificados e servir o frontend.

    Emita certificados para o domínio

    ```bash
    sudo certbot certonly --nginx \
      -d example.com -d www.example.com \
      --email seu@email.com --agree-tos --non-interactive
    ```

    > Certifique-se que o Nginx do host está rodando antes de emitir o certificado.

3. Suba os containers do backend e banco de dados

    ```bash
    cd /home/ubuntu/seu-projeto/deploy-flow
    make up
    ```

    - O container do NestJS ficará isolado na rede interna (backend-network).
    - O Postgres usa volume persistente (pgdata).
    - O Nginx do host faz proxy reverso para o backend via rede interna, protegendo a API e expondo apenas o que for necessário.

## 3. Deploy contínuo (CI/CD)

1. Push para a branch `main` → GitHub Actions dispara pipeline.

2. Pipeline executa:
  - Testes unitários e de integração
  - Build do backend
  - Atualização dos containers no EC2 via SSH

3. Caso algo falhe:
  - Rodar `make rollback` no EC2
  - Notificação automática no Discord

## 4. Considerações de segurança
- **API pública** é servida via Nginx do host, HTTPS obrigatório
- Containers do backend não expõem portas externas diretamente (`expose` apenas)
- Banco de dados protegido por volume e não exposto publicamente

## Conclusão

Push no main → GitHub Actions → SSH para EC2 → roda make up.
Se falhar, roda make rollback e notifica no Discord.
Sempre mantém o banco de dados seguro via volume (pgdata).


             ┌───────────────────────┐
             │  GitHub / GitLab CI   │
             │  (Push / PR / Merge) │
             └───────────┬──────────┘
                         │
                         │ Build & Test
                         ▼
             ┌───────────────────────┐
             │   EC2 (Host)          │
             │   - Nginx principal   │
             │   - Certbot SSL       │
             │   - Docker & Docker-Compose
             └───────────┬──────────┘
                         │
                         │ Reverse Proxy (HTTPS)
                         ▼
         ┌─────────────────────────────┐
         │   Backend Container (NestJS)│
         │   - Porta 3100 (interno)   │
         │   - Expose apenas redes     │
         │     backend-network         │
         └───────────┬────────────────┘
                     │
                     │ Rede interna (Docker Bridge)
                     ▼
             ┌───────────────────────┐
             │    PostgreSQL          │
             │    Container           │
             │    - Porta 5432        │
             │    - Rede backend-network
             └───────────────────────┘
