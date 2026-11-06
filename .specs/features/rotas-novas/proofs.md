# rotas-novas proofs

**HEAD**: e5f0650
**Tree**: clean
**Shell**: /bin/sh
**Result**: 32 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run unit / ✔ publishToMultipleAccounts envia socialAccountIds separados por vírgula com timeout de 30 s` | pass |
| C2 | `run unit / ✔ publishToMultipleAccounts remove repetidos e espaços dos IDs` | pass |
| C3 | `run unit / ✔ publishToMultipleAccounts envia title e publishTime em milissegundos` | pass |
| C4 | `run unit / ✔ publishToMultipleAccounts recusa lista de contas vazia` | pass |
| C5 | `run unit / ✔ publishToMultipleAccounts recusa ID de conta com vírgula` | pass |
| C6 | `run unit / ✔ publishToMultipleAccounts recusa post vazio` | pass |
| C7 | `run unit / ✔ publishToMultipleAccounts recusa videoUrl que não é http nem https` | pass |
| C8 | `run unit / ✔ publishToMultipleAccounts transforma o código 4011 em NodeApiError` | pass |
| C9 | `run unit / ✔ a coleção socialAccounts usa Resource Locator com lista e ID` | pass |
| C10 | `run unit / ✔ getPublishResult chama GET /publish-result com o ID codificado e timeout de 30 s` | pass |
| C11 | `run unit / ✔ getPublishResult recusa customVideoId vazio` | pass |
| C12 | `run unit / ✔ customVideoId tem a descrição do plano` | pass |
| C13 | `run unit / ✔ deleteProject chama DELETE /delete com confirmação ligada` | pass |
| C14 | `run unit / ✔ deleteProject devolve success true quando a resposta vem vazia` | pass |
| C15 | `run unit / ✔ deleteProject sem confirmação falha antes de qualquer requisição` | pass |
| C16 | `run unit / ✔ deleteProject com projectId vazio falha com Project ID is required` | pass |
| C17 | `run unit / ✔ confirmDelete é boolean desligado e a operação avisa com Warning:` | pass |
| C18 | `run unit / ✔ projectId de deleteProject é texto obrigatório` | pass |
| C19 | `run unit / ✔ createClips envia clipModel clip_v2` | pass |
| C20 | `run unit / ✔ createClips sem clipModel não envia a chave` | pass |
| C21 | `run unit / ✔ clipModel tem clip_v1 padrão e avisa o custo 1.25 times` | pass |
| C22 | `run unit / ✔ videoType tem Dropbox 13 e Instagram 14 e não envia ext` | pass |
| C23 | `run unit / ✔ todo parâmetro da 1.1.0 mantém name e type` | pass |
| C24 | `run unit / ✔ v1 publishVideo envia finalVideoId numérico e socialAccountId em texto` | pass |
| C25 | `run unit / ✔ o pacote está na 1.2.0 com CHANGELOG e README das operações novas` | pass |
| C26 | `run unit / ✔ o node continua usableAsTool` | pass |
| C27 | `npm run lint` | pass |
| C28 | `run unit / ✔ as três operações novas transformam o código 4001 em NodeApiError` | pass |
| C29 | `run unit / ✔ getPublishResult e deleteProject recusam . e .. como ID` | pass |
| Build | `npm run build` | pass |
| Build | `npx tsc --noEmit` | pass |
| Build | `npm run lint` | pass |

## Output

`Run unit` - exit 0

```
▶ Vizard social operations
  ✔ converts scheduled publishing dates to Unix milliseconds (0.61159ms)
✔ Vizard social operations (0.799935ms)
▶ Vizard node definition
  ✔ defaults to short-video editing and can be used as an AI tool (0.476317ms)
  ✔ keeps the API key in a password credential and the required Vizard header (0.332969ms)
✔ Vizard node definition (1.133234ms)
ℹ tests 74
ℹ suites 18
ℹ pass 74
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 650.12032
```

`npm run lint` - exit 0

```
> n8n-nodes-vizard@1.2.0 lint
> n8n-node lint

┌   n8n-node lint  v0.55.5
```
