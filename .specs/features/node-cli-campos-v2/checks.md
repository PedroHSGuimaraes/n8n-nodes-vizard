# Vizard: node-cli 0.55 e campos guiados (versão 2) checks

Build: `npm run build`; `npx tsc --noEmit`; `npm run lint`
Run unit: `npm run build --silent && node --test --test-reporter=spec test/*.test.cjs`
Plan: `.specs/features/node-cli-campos-v2/plan.md`

39 checks in 4 slices · 4 one-way doors · 0 open

## Checks

### S1 - toolchain do node-cli 0.55.5

**C1** - `npm run lint` sai com código 0 e 0 erros (AC 1)
Proof: `npm run lint`

**C2** - O build gera o node, a credencial e os dois ícones em `dist` (AC 2)
Proof: run unit | ✔ o build gera o node, a credencial e os ícones em dist

**C3** - O `package.json` fixa node-cli 0.55.5, n8n-workflow `^2.46.5`, peer `*`, strict e nenhum `dependencies` (AC 3)
Proof: run unit | ✔ o package.json fixa o node-cli, o n8n-workflow e o modo strict

**C4** - O lock resolve o n8n-workflow em 2.46.5 ou mais nova (AC 4)
Proof: run unit | ✔ o package-lock resolve o n8n-workflow em 2.46.5 ou mais nova

**C5** - A categoria do node é `Marketing & Content` (AC 1)
Proof: run unit | ✔ a categoria do node é aceita pelo lint oficial

**C6** - `npm test` compila e roda a suíte inteira com `fail 0` (AC 5)
Proof: `npm test`

**C7** - O workflow de CI roda `npm ci`, lint, test e build no Pull Request (AC 6)
Proof: run unit | ✔ o workflow de CI roda ci, lint, test e build no Pull Request

### S2 - versão 1 continua igual

**C8** - Na v1, `publishVideo` envia `POST /publish-video` com `finalVideoId` numérico e `socialAccountId` em texto (AC 1)
Proof: run unit | ✔ v1 publishVideo envia finalVideoId numérico e socialAccountId em texto

**C9** - Na v1, `generateCaption` envia `POST /ai-social` com `finalVideoId` 14015572 (AC 2)
Proof: run unit | ✔ v1 generateCaption envia o finalVideoId numérico para /ai-social

**C10** - A v1 expõe todo parâmetro da 1.0.0 com o mesmo `name` e `type` (AC 3)
Proof: run unit | ✔ v1 expõe todo parâmetro da 1.0.0 com o mesmo name e type

**C11** - Na v1, `finalVideoId` 0 lança `Final Video ID must be a positive integer` (AC 4)
Proof: run unit | ✔ v1 recusa finalVideoId 0 com a mensagem da 1.0.0

### S3 - campos guiados na versão 2

**C12** - O node declara `version` `[1, 2]` e `defaultVersion` 2 (AC 1)
Proof: run unit | ✔ o node nasce na versão 2 e mantém a 1

**C13** - `finalVideoId` e `socialAccountId` são Resource Locator com modos `list` (padrão, pesquisável) e `id` na v2 (AC 2)
Proof: run unit | ✔ finalVideoId e socialAccountId são Resource Locator com lista e ID na v2

**C14** - A v2 pede `projectId` obrigatório em Generate AI Caption e Publish Video, com a descrição do plano (AC 3)
Proof: run unit | ✔ a v2 pede o projectId nas operações sociais de legenda e publicação

**C15** - `searchVideos` chama `GET /query/17861706` com `timeout` 30000 e devolve um item por vídeo, título cortado em 60 caracteres e duração em segundos (AC 4)
Proof: run unit | ✔ searchVideos lista videos[] do projeto com título cortado e duração

**C16** - `searchVideos` devolve `results` vazio quando `videos[]` não vem (AC 4)
Proof: run unit | ✔ searchVideos devolve results vazio quando videos[] não vem

**C17** - `searchVideos` nomeia o vídeo sem título como `Video <id>` (Assumptions)
Proof: run unit | ✔ searchVideos nomeia o vídeo sem título como Video

**C18** - `searchVideos` devolve vazio, sem erro, com o código 1000 (AC 5)
Proof: run unit | ✔ searchVideos devolve vazio, sem erro, com o projeto em processamento

**C19** - `searchVideos` não chama a API com `projectId` vazio (AC 6)
Proof: run unit | ✔ searchVideos não chama a API com projectId vazio

**C20** - `searchSocialAccounts` chama `GET /social-accounts` com `timeout` 30000 e devolve `plataforma - usuário`, usando `page` sem `username` (AC 7)
Proof: run unit | ✔ searchSocialAccounts lista publishAccounts[] como plataforma

**C21** - As duas listas filtram pelo texto de busca sem diferenciar maiúscula (AC 8)
Proof: run unit | ✔ as duas listas filtram pelo texto sem diferenciar maiúscula

**C22** - Na v2, o modo `list` entrega o `finalVideoId` como número (AC 9)
Proof: run unit | ✔ modo list entrega o finalVideoId como número

**C23** - Na v2, o modo `id` tira o espaço das pontas do `socialAccountId` (AC 10)
Proof: run unit | ✔ modo id tira o espaço das pontas do socialAccountId

**C24** - `finalVideoId` `abc` lança `Final Video ID must be a positive integer` (AC 11)
Proof: run unit | ✔ finalVideoId "abc" lança a mensagem de inteiro positivo

**C25** - `socialAccountId` vazio lança `Social Account ID is required` (AC 12)
Proof: run unit | ✔ socialAccountId vazio lança Social Account ID is required

**C26** - O node mantém `usableAsTool` e aceita valor de expressão em texto puro no `finalVideoId` (AC 13)
Proof: run unit | ✔ o node continua utilizável como tool de IA
Proof: run unit | ✔ valor de expressão em texto puro também é aceito no finalVideoId

**C27** - Chave inválida vira `NodeApiError` na v1 e nas duas listas da v2, tanto pelo código 4001 no corpo quanto pelo HTTP 401 do transporte (Surface 401)
Proof: run unit | ✔ v1 publishVideo com chave inválida lança NodeApiError
Proof: run unit | ✔ as duas listas da v2 propagam a chave inválida como NodeApiError
Proof: run unit | ✔ erro HTTP 401 do transporte vira NodeApiError na lista e na publicação (F6)

### S4 - lançamento 1.1.0 com estágio

**C28** - O `package.json` está na 1.1.0 e traz `funding` do tipo `individual` do dono (AC 1)
Proof: run unit | ✔ o package.json está na 1.1.0 e traz o funding do dono

**C29** - O `CHANGELOG.md` tem a seção `## 1.1.0` com categoria, versão 2 e node-cli (AC 1)
Proof: run unit | ✔ o CHANGELOG tem a seção 1.1.0 com os três assuntos

**C30** - O workflow de publicação usa `stage publish` do npm 12.2.2, `RELEASE_MODE`, `workflow_dispatch` e a mesma versão de Node do CI (AC 2)
Proof: run unit | ✔ o publish.yml publica por stage, com a mesma versão de Node do ci.yml

**C31** - O README traz as seções do padrão completo, o selo de apoio e descreve as duas listas novas (AC 3)
Proof: run unit | ✔ o README segue o padrão completo do dono

**C32** - A tag `v1.1.0` deixa a versão na fila Staged Packages e, aprovada, `npm view n8n-nodes-vizard version` devolve 1.1.0 (AC 4)
Proof: walk - o dono aprova a versão na aba Staged Packages do npm depois da tag; nada disto roda no PR

### S5 - achados do Verifier fechados

**C33** - O `projectId` social não aparece na v1 (AC 3, F1)
Proof: run unit | ✔ o projectId social não aparece na v1 (F1)

**C34** - `finalVideoId` só aceita dígitos; `0x1F`, `1e3`, `1.5` e `-4` lançam `Final Video ID must be a positive integer` (AC 11, F2)
Proof: run unit | ✔ finalVideoId só aceita dígitos: 0x1F e 1e3 são recusados (F2)

**C35** - O corte do título de 60 caracteres não parte um emoji ao meio (AC 4, F3)
Proof: run unit | ✔ o corte do título não deixa emoji pela metade (F3)

**C36** - Duração nula ou zero não mostra o sufixo de segundos (AC 4, F4)
Proof: run unit | ✔ duração nula ou zero não mostra o sufixo de segundos (F4)

**C37** - Vídeo sem `videoId` é descartado da lista (AC 4, F5)
Proof: run unit | ✔ vídeo sem videoId é descartado da lista (F5)

**C38** - O `projectId` é codificado na rota `GET /query/{projectId}` da lista (AC 4, F7)
Proof: run unit | ✔ o projectId é codificado na rota da lista (F7)

**C39** - O CI exige os passos `run:` e o README exige o selo de apoio completo (AC 6 e S4 AC 3, F8)
Proof: run unit | ✔ o workflow de CI roda ci, lint, test e build no Pull Request
Proof: run unit | ✔ o README segue o padrão completo do dono

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `node vizard` v2 statuses (2) | 200 C22 · 401 C27 | - |
| `node vizard` v1 statuses (2) | 200 C8 · 401 C27 | - |
| `listSearch searchVideos` statuses (2) | 200 C15 · 401 C27 | - |
| `listSearch searchSocialAccounts` statuses (2) | 200 C20 · 401 C27 | - |
| one-way doors (4) | versão do node C12 · nome dos parâmetros C10 C13 · versão do pacote C28 · publicação C30 | - |
| parâmetros v2 como Resource Locator (2) | `finalVideoId` C13 C22 · `socialAccountId` C13 C23 | - |
| operações sociais que leem o locator (2) | `publishVideo` C22 C23 · `generateCaption` C26 | - |
| exemplos do filtro e do título (4) | título de 70 caracteres C15 · sem título C17 · filtro `insta` C21 · filtro `verão` C21 | - |

- Claims naming a status code, route or response shape: C8, C9, C15, C20, C27 - each has a proof that crosses the boundary
- No other check claims more than the single case its proof exercises

## Swept

- validation: C24, C25
- failure modes: C18
- idempotency: n/a - o node só repassa requisições e não guarda estado
- authorization: C27
- concurrency: n/a - sem estado compartilhado nem escrita local
- data lifecycle: n/a - o node não guarda dado
- dependency failure: C27
- state transitions: n/a - o node não tem estados
- observability: n/a - sem requisito de log nesta fatia

## Handoff

- **Settled mid-build:** aprovação antecipada do dono, "Aprovo com antecedência (Recomendado · Jev 0,96)"
- **Dispatched:** Verifier (haiku, fresh) at HEAD 51bbfc7 - returned (FAIL: F1, F2 médios; F3-F10 baixos; achados fechados no commit seguinte)
- **Boundary:** none yet
- **Abandoned:** none
- **Walked:** n/a - sem tela nova; o editor do n8n mostra as listas
