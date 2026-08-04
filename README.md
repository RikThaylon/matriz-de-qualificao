# Matriz de Qualificação Operacional

Piloto visual para alocar operadores em máquinas de fábrica com validação de qualificação. A interface foi pensada para TV Full HD, mas responde para tablet e computador.

## Fluxo demonstrável

1. Abra o setor **Usinagem e Conformação**.
2. Arraste uma pessoa do lobby sobre uma máquina vazia.
3. O sistema confirma uma aderência plena, sinaliza atenção entre 70–99% ou bloqueia abaixo de 70% / requisito crítico.
4. Abra **Insights** para riscos de cobertura, treinamentos e validades.
5. Use **Editar layout** para adicionar máquinas e visualizar o contexto de alteração.

## Executar

Requer Docker Desktop:

```bash
docker compose up
```

Em seguida, abra `http://localhost:5173`. O frontend pode ser executado de forma independente com `npm install` e `npm run dev` quando Node.js estiver instalado.

## Deploy clássico no Render + Neon

Este projeto não usa Blueprint nem `render.yaml`. Crie os serviços no painel do Render. O banco PostgreSQL é o Neon; o Render hospeda somente a API, o site estático e, para tempo real distribuído, o Redis.

### 1. Prepare as URLs do Neon

No botão **Connect** do projeto Neon, copie duas URLs, sempre com `sslmode=require`:

- **Pooled connection** → `DATABASE_URL` (a API em execução).
- **Direct connection** → `DIRECT_URL` (Prisma e mudanças de schema).

Não coloque essas URLs no GitHub. Elas entram somente como variáveis de ambiente no Render.

### 2. Crie o Web Service da API

No Render, acesse **New → Web Service**, conecte `RikThaylon/matriz-de-qualificao` e preencha:

| Campo | Valor |
| --- | --- |
| Branch | `main` |
| Runtime | `Node` |
| Root Directory | *(vazio — a API também usa o schema Prisma na raiz do repositório)* |
| Build Command | `npm install && npx prisma generate && npm run build -w @matriz/api` |
| Pre-Deploy Command | `npx prisma db push` |
| Start Command | `npm run start:prod -w @matriz/api` |
| Health Check Path | `/v1/health` |
| Plan | `Starter` ou superior |

Em **Environment**, adicione:

| Chave | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | URL **pooled** do Neon |
| `DIRECT_URL` | URL **direct** do Neon |
| `REDIS_URL` | URL interna do Render Key Value, quando criado no passo 4 |

O pre-deploy aplica o schema Prisma antes de colocar a nova API no ar. Esse recurso é disponível nos planos pagos de Web Service; se escolher um plano sem pre-deploy, execute `npx prisma db push` uma vez a partir de uma máquina com as duas URLs do Neon configuradas.

Após o deploy, confirme `https://<sua-api>.onrender.com/v1/health`; a resposta deve ser `{ "status": "ok" }`.

### 3. Crie o Static Site do frontend

No Render, acesse **New → Static Site**, escolha o mesmo repositório e preencha:

| Campo | Valor |
| --- | --- |
| Branch | `main` |
| Root Directory | `apps/web` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Em **Environment**, crie `VITE_API_URL` com a URL pública da API, por exemplo `https://matriz-qualificacao-api.onrender.com`. Salve com **Save, rebuild, and deploy**, pois variáveis `VITE_` são incorporadas durante o build do frontend.

Em **Redirects/Rewrites**, adicione uma regra de rewrite de `/*` para `/index.html` (status `200`) para manter a SPA funcional ao abrir rotas diretamente.

### 4. Crie o Redis de tempo real

Para sustentar Socket.IO, presença e pub/sub em mais de uma instância, crie **New → Key Value** no Render. Use o mesmo ambiente/região da API, mantenha o acesso externo bloqueado e copie a **Internal Connection String** para `REDIS_URL` no Web Service. Em seguida, faça redeploy da API.

O Neon substitui apenas o PostgreSQL — ele não substitui Redis. A API continua funcionando sem `REDIS_URL` para demonstração em uma instância, mas o Redis é necessário para a arquitetura de tempo real distribuída.

## Estrutura

- `apps/web` — React + TypeScript, Vite, Tailwind, Framer Motion e dnd-kit.
- `apps/api` — NestJS com endpoint inicial de validação de alocação e validação de DTO.
- `prisma/schema.prisma` — modelo PostgreSQL de setores, máquinas, requisitos, pessoas, qualificações, alocações, eventos e insights.
- `docker-compose.yml` — serviços para frontend, API, PostgreSQL e Redis.

## Próximos incrementos de produção

A interface já demonstra as regras do piloto no cliente e o serviço Nest contém a mesma regra central para o endpoint `POST /v1/allocations/validate`. Para produção, o próximo passo é conectar o `QualificationService` ao Prisma, publicar as mutações numa gateway Socket.IO com adaptador Redis, e substituir os dados demonstrativos por seed Prisma. O modelo inclui `Machine.version` para controle otimista de concorrência.
