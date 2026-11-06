# Vizard: rotas novas da API checks

Build: `npm run build`; `npx tsc --noEmit`; `npm run lint`
Run unit: `npm run build --silent && node --test --test-reporter=spec test/*.test.cjs`
Plan: `.specs/features/rotas-novas/plan.md`

29 checks in 5 slices · 3 one-way doors · 0 open

## Checks

### S1 - publicar em várias contas

**C1** - `publishToMultipleAccounts` chama `POST /batch-publish-video` com `socialAccountIds` "111,222", `videoUrl`, `post` e `timeout` 30000 (AC 1)
Proof: run unit | ✔ publishToMultipleAccounts envia socialAccountIds separados por vírgula com timeout de 30 s

**C2** - Espaço nas pontas sai e o ID repetido vira um só (AC 1)
Proof: run unit | ✔ publishToMultipleAccounts remove repetidos e espaços dos IDs

**C3** - `title` e `publishTime` em milissegundos entram no corpo (AC 2)
Proof: run unit | ✔ publishToMultipleAccounts envia title e publishTime em milissegundos

**C4** - Sem nenhuma conta, lança `Select at least one social account` sem requisição (AC 3)
Proof: run unit | ✔ publishToMultipleAccounts recusa lista de contas vazia

**C5** - ID com vírgula lança `Social account IDs cannot contain commas` sem requisição (AC 4)
Proof: run unit | ✔ publishToMultipleAccounts recusa ID de conta com vírgula

**C6** - `post` vazio lança `Post is required` sem requisição (AC 5)
Proof: run unit | ✔ publishToMultipleAccounts recusa post vazio

**C7** - `videoUrl` ftp lança `Video URL must be an absolute HTTP or HTTPS URL` sem requisição (AC 6)
Proof: run unit | ✔ publishToMultipleAccounts recusa videoUrl que não é http nem https

**C8** - O código 4011 vira `NodeApiError` com a descrição `The social account ID is invalid.` (AC 7)
Proof: run unit | ✔ publishToMultipleAccounts transforma o código 4011 em NodeApiError

**C9** - `socialAccounts` é `fixedCollection` com Resource Locator `list` e `id`, e a operação avisa que publica em todas as contas (AC 8)
Proof: run unit | ✔ a coleção socialAccounts usa Resource Locator com lista e ID

### S2 - consultar o resultado da publicação

**C10** - `getPublishResult` chama `GET /publish-result/abc-123` com `timeout` 30000, e `a/b c` vira `a%2Fb%20c` (AC 1)
Proof: run unit | ✔ getPublishResult chama GET /publish-result com o ID codificado e timeout de 30 s

**C11** - `customVideoId` vazio lança `Custom Video ID is required` sem requisição (AC 2)
Proof: run unit | ✔ getPublishResult recusa customVideoId vazio

**C12** - `customVideoId` tem a descrição do plano (AC 3)
Proof: run unit | ✔ customVideoId tem a descrição do plano

### S3 - apagar projeto com confirmação

**C13** - `deleteProject` com confirmação chama `DELETE /delete/17861706` com `timeout` 30000 (AC 1)
Proof: run unit | ✔ deleteProject chama DELETE /delete com confirmação ligada

**C14** - Resposta vazia vira `{ "success": true }` no `Vizard.execute` (AC 1)
Proof: run unit | ✔ deleteProject devolve success true quando a resposta vem vazia

**C15** - Sem confirmação, ou com `confirmDelete` ausente, lança `Confirm Delete must be enabled to delete a project` sem requisição (AC 2)
Proof: run unit | ✔ deleteProject sem confirmação falha antes de qualquer requisição

**C16** - Com confirmação e `projectId` vazio lança `Project ID is required` (AC 2)
Proof: run unit | ✔ deleteProject com projectId vazio falha com Project ID is required

**C17** - `confirmDelete` é `boolean` padrão `false` com descrição em `Whether`, e a operação começa com `Warning:` (AC 3)
Proof: run unit | ✔ confirmDelete é boolean desligado e a operação avisa com Warning:

**C18** - `projectId` de `deleteProject` é texto obrigatório (AC 4)
Proof: run unit | ✔ projectId de deleteProject é texto obrigatório

### S4 - clipModel e fontes Dropbox e Instagram

**C19** - `clip_v2` entra no corpo de `POST /create` (AC 1)
Proof: run unit | ✔ createClips envia clipModel clip_v2

**C20** - Sem `clipModel` a chave não vai (AC 2)
Proof: run unit | ✔ createClips sem clipModel não envia a chave

**C21** - `clipModel` tem `clip_v1` padrão e a descrição diz `1.25 times` (AC 3)
Proof: run unit | ✔ clipModel tem clip_v1 padrão e avisa o custo 1.25 times

**C22** - `videoType` tem Dropbox 13 e Instagram 14 depois de LinkedIn, e o 13 não envia `ext` (AC 4)
Proof: run unit | ✔ videoType tem Dropbox 13 e Instagram 14 e não envia ext

### S5 - compatibilidade e lançamento 1.2.0

**C23** - Todo parâmetro da 1.1.0 mantém `name` e `type` (AC 1)
Proof: run unit | ✔ todo parâmetro da 1.1.0 mantém name e type

**C24** - Na v1, `publishVideo` envia o corpo da 1.1.0 (AC 2)
Proof: run unit | ✔ v1 publishVideo envia finalVideoId numérico e socialAccountId em texto

**C25** - Versão 1.2.0, `CHANGELOG.md` e `README.md` com as operações novas (AC 3)
Proof: run unit | ✔ o pacote está na 1.2.0 com CHANGELOG e README das operações novas

**C26** - O node mantém `usableAsTool: true` (AC 4)
Proof: run unit | ✔ o node continua usableAsTool

**C27** - Lint com 0 erros (AC 5)
Proof: `npm run lint`

**C28** - As três rotas novas transformam a resposta `4001` em `NodeApiError` com a descrição `Invalid API key.` (AC 1 de S1, S2 e S3)
Proof: run unit | ✔ as três operações novas transformam o código 4001 em NodeApiError

**C29** - `getPublishResult` e `deleteProject` recusam `.` e `..` como ID, sem requisição (achado F1 do Verifier; AC 2 de S2 e AC 2 de S3)
Proof: run unit | ✔ getPublishResult e deleteProject recusam . e .. como ID

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `POST /batch-publish-video` statuses (3) | 200 C1 · 401 C28 · 4011 C8 | - |
| `GET /publish-result/{customVideoId}` statuses (2) | 200 C10 · 401 C28 | - |
| `DELETE /delete/{projectId}` statuses (2) | 200 C13 · 401 C28 | - |
| `POST /create` novos campos (3) | clipModel C19 · videoType 13 C22 · videoType 14 C22 | - |
| portas do Landing (3) | nomes dos parâmetros C9 C12 C17 C21 · formato de socialAccountIds C1 C2 · versão 1.2.0 C25 | - |
| exemplos de S1 AC 1 (2) | dois IDs C1 · repetido C2 | - |

## Swept

- validation: C4 C5 C6 C7 C11 C15 C16
- failure modes: C8
- idempotency: n/a - o node não guarda estado; repetir a chamada é decisão do workflow
- authorization: existing - a credencial `vizardApi` e o `401` de `vizardApiRequest`
- concurrency: n/a - cada item roda em sequência no `execute`
- data lifecycle: C15 - apagar só com confirmação ligada
- dependency failure: existing - `vizardApiRequest` com `timeout` e `NodeApiError` (C1 C10 C13 provam o `timeout` 30000)
- state transitions: n/a - o node não tem estado
- observability: n/a - sem requisito de log neste pacote

## Handoff

- **Settled mid-build:** none
- **Dispatched:** Verifier independente (sonnet) em f2168b8, returned: 4 achados fechados em d0733d3
- **Boundary:** nenhum check fechado ainda
- **Abandoned:** none
- **Walked:** none - sem tela com captura; o editor do n8n não é dirigido por este pacote
