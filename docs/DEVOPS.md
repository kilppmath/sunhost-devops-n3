# DevOps N3 — SunHost

## O que foi preparado

- Branches locais `main`, `develop` e `feature/devops-n3`.
- `CI e Delivery`: verifica TypeScript (análise estática), executa testes unitários de credenciais e testes HTTP da API, exige cobertura mínima, compila e constrói uma imagem Docker. Em push na develop, entrega o mesmo commit para main por fast-forward.
- `Deployment EC2`: após CI e Delivery bem-sucedido na develop, confirma que a main contém exatamente aquele commit, baixa a imagem daquele run e envia para EC2 via SSH.
- Porta pública 80; servidor Node na porta interna 3001; healthcheck `/api/health`; dados de demonstração em volume persistente.
- Deploy mantém a imagem anterior e tenta restaurá-la se a nova versão falhar no healthcheck. Há interrupção breve na troca do contêiner; não é zero downtime. Rollback é de imagem, não de dados.

O encadeamento usa `workflow_run`, pois pushes com `GITHUB_TOKEN` não disparam outro workflow de push. Não exige token pessoal nem conta Docker Hub. Referência: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

## Verificação local

Use Node 24 e pnpm 10.4.1 (versões do Docker e do CI):

```sh
npx pnpm@10.4.1 install --frozen-lockfile
npx pnpm@10.4.1 lint
npx pnpm@10.4.1 test:coverage
npx pnpm@10.4.1 build
```

Cobertura inclui todos os arquivos do servidor, sem os testes. Limites: 70% de linhas, statements e funções; 60% de branches. Os testes HTTP usam modo demonstração e arquivo temporário, sem alterar dados locais. PostgreSQL não está coberto por testes de integração nesta etapa. O relatório HTML fica em `coverage/index.html` e é publicado como artefato do CI.

## Configuração pendente do GitHub

É necessário acesso de escrita ao repositório. Cadastre as configurações abaixo em Settings → Secrets and variables → Actions:

| Tipo | Nome | Valor |
|---|---|---|
| Variable | EC2_HOST | IP público ou DNS da EC2 |
| Variable | EC2_USER | Usuário SSH, normalmente ubuntu |
| Secret | SSH_PRIVATE_KEY | Chave privada autorizada no servidor |
| Secret | SSH_KNOWN_HOSTS | Linha de known_hosts, com chave do servidor conferida por canal confiável |

Crie o environment `production` sem aprovação obrigatória, para a demonstração automática. O workflow CI já solicita `contents: write` somente no job de Delivery. Regras da main precisam permitir esse fast-forward; se a instituição exigir PR obrigatório na main, adapte a promoção para esse modelo antes de ativar o pipeline. Na develop, exija o job `quality` antes de mesclar PRs.

Para ativação inicial, publique as alterações por um PR revisável e garanta que ambos os arquivos de workflow estejam também na branch padrão `main`, pois `workflow_run` depende disso. Depois sincronize develop com main. O histórico da main deve ser ancestral do commit entregue; não use squash separado na main e develop. A promoção falha se os históricos divergirem, em vez de sobrescrever código.

## EC2 — preparar após confirmar a instância

Use uma EC2 Ubuntu x86_64 (a imagem é construída em runner amd64). A criação da instância e o IP público podem gerar cobranças; o projeto não cria recursos automaticamente.

1. Instale Docker Engine e Compose pelo procedimento oficial: https://docs.docker.com/engine/install/ubuntu/
2. Habilite Docker no boot e configure o usuário de deploy no grupo docker. Esse grupo permite controle administrativo do host. Reconecte o SSH depois da alteração.
3. Crie `/opt/sunhost` com o usuário de deploy como dono.
4. Copie `ops/production.env.example` para `/opt/sunhost/.env.production` e preencha `ADMIN_PASSWORD` e `PASSWORD_PEPPER` com valores aleatórios exclusivos. Restrinja a permissão do arquivo a 600. Não versione o arquivo.
5. Libere HTTP 80 no Security Group. O runner GitHub precisa alcançar SSH 22; configure a origem conforme a estratégia de acesso da instância. Não exponha PostgreSQL publicamente.
6. Confira a chave de host SSH no servidor e registre o known_hosts no GitHub; o workflow mantém a verificação de identidade do servidor.
7. Verifique que o usuário de deploy consegue executar `docker info` e `docker compose version` sem sudo e gravar em `/opt/sunhost`.

A configuração padrão usa o modo demonstração existente, com persistência em volume Docker. Para PostgreSQL, configure `DEMO_MODE=false` e `DATABASE_URL` no servidor. Senhas e pepper são obrigatórios em produção. Sessões ficam em memória e usuários precisam entrar novamente após reinício. HTTP por IP atende à demonstração acadêmica; use apenas dados fictícios.

## Roteiro da apresentação

1. Abra `http://IP_DA_EC2` e mostre a versão inicial.
2. A partir de develop atualizada, crie `feature/apresentacao`, altere um texto visível, faça commit e push.
3. Abra PR para develop e mostre análise estática, testes e cobertura passando.
4. Mescle o PR. Mostre o novo run de `CI e Delivery` na develop, a imagem entregue e a main atualizada.
5. Mostre `Deployment EC2` iniciado automaticamente e o healthcheck aprovado.
6. Atualize o navegador e mostre o texto novo. Guarde links dos runs e do PR como evidências.

## Estado da validação nesta máquina

- 16 testes aprovados: 3 unitários e 13 testes HTTP.
- 80,95% de linhas/statements, 66,66% de branches e 100% de funções do servidor.
- TypeScript e compilação de produção aprovados.
- Frontend `/` e `/api/health` responderam HTTP 200 no servidor compilado.
- Validação local executada em Node 26 instalado na máquina; CI e Docker usam Node 24.
- Docker não estava instalado: imagem, Compose, SSH, rollback e workflows ainda precisam de execução real no GitHub/EC2. Configuração AWS e acesso de escrita ao GitHub ainda não foram informados.

## Teste de interface Selenium (requisito atualizado)

Execute `npx pnpm@10.4.1 build` e depois `npx pnpm@10.4.1 test:ui`. O teste abre Chrome headless em perfil isolado, inicia a API em porta livre e usa arquivo de dados temporário. Verifica os cartões iniciais, busca por um destino inexistente, confere o estado vazio e usa “Limpar busca” para restaurar os cartões. Não usa a sessão pessoal do navegador.

O Selenium Manager baixa o driver oficial compatível quando necessário. É preciso Chrome instalado e acesso à internet na primeira execução. Referência: https://www.selenium.dev/documentation/selenium_manager/

O workflow executa o teste depois da compilação e antes da entrega. Prints de tela, resultado JSON e log do driver são publicados no artefato `selenium-<commit>`, disponível por 14 dias. Na máquina local, o Chrome encerrou na criação da sessão; a execução no GitHub deve ser conferida antes de considerar o requisito validado.

O PDF atualizado informa entrega em 19/11 e exige novo repositório e teste Selenium. Repositório desta entrega: https://github.com/kilppmath/sunhost-devops-n3
