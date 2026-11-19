# SunHost Floripa

Aplicação acadêmica full-stack para descoberta e publicação de acomodações em Florianópolis. A interface mantém o redesign editorial, carrosséis, busca, filtros, favoritos e Pontos Cívicos. A autenticação, os envios de acomodações e a moderação agora usam uma API Express com **PostgreSQL**.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL 14 ou superior (opcional para a demonstração)
- npm ou pnpm

## Execução rápida para demonstração

O projeto inicia automaticamente em **modo demonstração local** quando o PostgreSQL não estiver instalado ou ligado. Nesse modo, usuários e submissões são salvos em `sunhost-demo-data.json`, permitindo gravar o MVP sem configurar banco de dados.

Execute:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O terminal exibirá `modo demonstração local` quando o PostgreSQL não estiver disponível. Para forçar esse comportamento, defina `DEMO_MODE=true` no arquivo `.env`. Para exigir PostgreSQL e receber erro caso ele esteja desligado, defina `DEMO_MODE=false`.

## Configuração opcional do PostgreSQL

Crie um banco vazio e copie `.env.example` para `.env`, ajustando `DATABASE_URL`:

```bash
createdb sunhost_floripa
cp .env.example .env
```

Quando o PostgreSQL está disponível, o servidor cria automaticamente as tabelas definidas em `schema.sql` e prepara o administrador configurado por `ADMIN_EMAIL` e `ADMIN_PASSWORD`. O schema contém usuários, acomodações e comentários, com chaves estrangeiras, índices e regras de status. Nenhuma senha é armazenada em texto puro; o servidor usa `scrypt` com pepper configurável.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O comando inicia o Vite e a API simultaneamente; durante o desenvolvimento, o Vite encaminha `/api` para a API na porta 3001.

Para executar apenas a API:

```bash
npm run dev:api
```

O administrador padrão é definido no `.env`:

| Campo | Valor padrão |
|---|---|
| E-mail | `admin@sunhost.local` |
| Senha | `Floripa@2026` |

Altere essa senha antes de qualquer uso fora do ambiente acadêmico.

## Validação e produção

```bash
npm run check
npm run build
NODE_ENV=production npm start
```

A versão de produção serve o frontend compilado e a API pelo mesmo processo. Antes de iniciar, exporte `DATABASE_URL`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` ou mantenha-os no `.env` usando um carregador de ambiente da sua preferência.

## Funcionalidades persistentes

Usuários podem criar conta e publicar acomodações para análise. O administrador pode aprovar, rejeitar ou remover envios. Os dados são gravados no PostgreSQL e não dependem do `localStorage`; favoritos e Pontos Cívicos continuam sendo preferências locais do navegador. A tabela `comments` está pronta para comentários verificados e moderação no próximo módulo da aplicação.

## Estrutura principal

- `client/`: interface React/Vite.
- `server/index.ts`: API, autenticação e servidor de produção.
- `schema.sql`: schema PostgreSQL aplicado no boot.
- `.env.example`: variáveis de ambiente necessárias.

## Projeto DevOps N3

Veja [o guia DevOps](docs/DEVOPS.md) para testes, cobertura, os dois workflows, Docker, configuração da EC2 e roteiro da apresentação. Em produção, defina `ADMIN_PASSWORD` e `PASSWORD_PEPPER`; o servidor exige ambos. A rota `/api/admin/ensure` agora exige autenticação de administrador.
