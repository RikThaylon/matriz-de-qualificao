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

## Deploy no Render + Neon

O arquivo `render.yaml` cria três recursos: API NestJS, site estático Vite e Render Key Value (Redis). O PostgreSQL não é criado no Render: ele é fornecido pelo Neon.

1. No Neon, crie o projeto e copie a **connection string pooled** com `sslmode=require`.
2. No Render, crie um Blueprint apontando para este repositório e informe `DATABASE_URL` com a URL do Neon.
3. Depois que a API existir, informe `VITE_API_URL` com a URL pública da API (por exemplo, `https://matriz-qualificacao-api.onrender.com`) e faça um redeploy do site estático.
4. Execute `npx prisma migrate deploy` como passo de release depois de criar a primeira migration; o modelo está em `prisma/schema.prisma`.

O Neon atende inteiramente ao banco PostgreSQL. O Redis permanece necessário para pub/sub do Socket.IO, presença e cache distribuído; o Blueprint cria uma instância Render Key Value privada para esta responsabilidade. O serviço de API está em plano `starter` porque eventos em tempo real não são adequados a instâncias que hibernam.

## Estrutura

- `apps/web` — React + TypeScript, Vite, Tailwind, Framer Motion e dnd-kit.
- `apps/api` — NestJS com endpoint inicial de validação de alocação e validação de DTO.
- `prisma/schema.prisma` — modelo PostgreSQL de setores, máquinas, requisitos, pessoas, qualificações, alocações, eventos e insights.
- `docker-compose.yml` — serviços para frontend, API, PostgreSQL e Redis.

## Próximos incrementos de produção

A interface já demonstra as regras do piloto no cliente e o serviço Nest contém a mesma regra central para o endpoint `POST /v1/allocations/validate`. Para produção, o próximo passo é conectar o `QualificationService` ao Prisma, publicar as mutações numa gateway Socket.IO com adaptador Redis, e substituir os dados demonstrativos por seed Prisma. O modelo inclui `Machine.version` para controle otimista de concorrência.
