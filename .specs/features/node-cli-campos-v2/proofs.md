# node-cli-campos-v2 proofs

**HEAD**: 3b9fe2d
**Tree**: clean
**Shell**: /bin/sh
**Result**: 46 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `npm run lint` | pass |
| C2 | `run unit / ✔ o build gera o node, a credencial e os ícones em dist` | pass |
| C3 | `run unit / ✔ o package.json fixa o node-cli, o n8n-workflow e o modo strict` | pass |
| C4 | `run unit / ✔ o package-lock resolve o n8n-workflow em 2.46.5 ou mais nova` | pass |
| C5 | `run unit / ✔ a categoria do node é aceita pelo lint oficial` | pass |
| C6 | `npm test` | pass |
| C7 | `run unit / ✔ o workflow de CI roda ci, lint, test e build no Pull Request` | pass |
| C8 | `run unit / ✔ v1 publishVideo envia finalVideoId numérico e socialAccountId em texto` | pass |
| C9 | `run unit / ✔ v1 generateCaption envia o finalVideoId numérico para /ai-social` | pass |
| C10 | `run unit / ✔ v1 expõe todo parâmetro da 1.0.0 com o mesmo name e type` | pass |
| C11 | `run unit / ✔ v1 recusa finalVideoId 0 com a mensagem da 1.0.0` | pass |
| C12 | `run unit / ✔ o node nasce na versão 2 e mantém a 1` | pass |
| C13 | `run unit / ✔ finalVideoId e socialAccountId são Resource Locator com lista e ID na v2` | pass |
| C14 | `run unit / ✔ a v2 pede o projectId nas operações sociais de legenda e publicação` | pass |
| C15 | `run unit / ✔ searchVideos lista videos[] do projeto com título cortado e duração` | pass |
| C16 | `run unit / ✔ searchVideos devolve results vazio quando videos[] não vem` | pass |
| C17 | `run unit / ✔ searchVideos nomeia o vídeo sem título como Video` | pass |
| C18 | `run unit / ✔ searchVideos devolve vazio, sem erro, com o projeto em processamento` | pass |
| C19 | `run unit / ✔ searchVideos não chama a API com projectId vazio` | pass |
| C20 | `run unit / ✔ searchSocialAccounts lista publishAccounts[] como plataforma` | pass |
| C21 | `run unit / ✔ as duas listas filtram pelo texto sem diferenciar maiúscula` | pass |
| C22 | `run unit / ✔ modo list entrega o finalVideoId como número` | pass |
| C23 | `run unit / ✔ modo id tira o espaço das pontas do socialAccountId` | pass |
| C24 | `run unit / ✔ finalVideoId "abc" lança a mensagem de inteiro positivo` | pass |
| C25 | `run unit / ✔ socialAccountId vazio lança Social Account ID is required` | pass |
| C26 | `run unit / ✔ o node continua utilizável como tool de IA` | pass |
| C26 | `run unit / ✔ valor de expressão em texto puro também é aceito no finalVideoId` | pass |
| C27 | `run unit / ✔ v1 publishVideo com chave inválida lança NodeApiError` | pass |
| C27 | `run unit / ✔ as duas listas da v2 propagam a chave inválida como NodeApiError` | pass |
| C27 | `run unit / ✔ erro HTTP 401 do transporte vira NodeApiError na lista e na publicação (F6)` | pass |
| C28 | `run unit / ✔ o package.json está na 1.1.0 e traz o funding do dono` | pass |
| C29 | `run unit / ✔ o CHANGELOG tem a seção 1.1.0 com os três assuntos` | pass |
| C30 | `run unit / ✔ o publish.yml publica por stage, com a mesma versão de Node do ci.yml` | pass |
| C31 | `run unit / ✔ o README segue o padrão completo do dono` | pass |
| C32 | `walk - o dono aprova a versão na aba Staged Packages do npm depois da tag; nada disto roda no PR` | pass (Walked) |
| C33 | `run unit / ✔ o projectId social não aparece na v1 (F1)` | pass |
| C34 | `run unit / ✔ finalVideoId só aceita dígitos: 0x1F e 1e3 são recusados (F2)` | pass |
| C35 | `run unit / ✔ o corte do título não deixa emoji pela metade (F3)` | pass |
| C36 | `run unit / ✔ duração nula ou zero não mostra o sufixo de segundos (F4)` | pass |
| C37 | `run unit / ✔ vídeo sem videoId é descartado da lista (F5)` | pass |
| C38 | `run unit / ✔ o projectId é codificado na rota da lista (F7)` | pass |
| C39 | `run unit / ✔ o workflow de CI roda ci, lint, test e build no Pull Request` | pass |
| C39 | `run unit / ✔ o README segue o padrão completo do dono` | pass |
| Build | `npm run build` | pass |
| Build | `npx tsc --noEmit` | pass |
| Build | `npm run lint` | pass |

## Output

`Run unit` - exit 0

```
▶ Vizard social operations
  ✔ converts scheduled publishing dates to Unix milliseconds (0.29226ms)
✔ Vizard social operations (0.38359ms)
▶ Vizard node definition
  ✔ defaults to short-video editing and can be used as an AI tool (0.21576ms)
  ✔ keeps the API key in a password credential and the required Vizard header (0.194526ms)
✔ Vizard node definition (0.588436ms)
ℹ tests 46
ℹ suites 11
ℹ pass 46
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 524.592404
```

`npm run lint` - exit 0

```
> n8n-nodes-vizard@1.1.0 lint
> n8n-node lint

┌   n8n-node lint  v0.55.5
```

`npm test` - exit 0

```
▶ Vizard social operations
  ✔ converts scheduled publishing dates to Unix milliseconds (0.319341ms)
✔ Vizard social operations (0.409874ms)
▶ Vizard node definition
  ✔ defaults to short-video editing and can be used as an AI tool (0.205329ms)
  ✔ keeps the API key in a password credential and the required Vizard header (0.170908ms)
✔ Vizard node definition (0.520633ms)
ℹ tests 46
ℹ suites 11
ℹ pass 46
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 456.269979
```
