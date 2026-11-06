# node-cli-campos-v2 verification

**Verdict**: PASS
**Proofs**: `proofs.md` at 3b9fe2d
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `npm run lint` | yes - comando; falha se a categoria voltar a Marketing |
| C2 | `estrutura.test.cjs` `o build gera o node, a credencial e os ícones em dist` | yes |
| C3 | `estrutura.test.cjs` `o package.json fixa o node-cli, o n8n-workflow e o modo strict` | yes |
| C4 | `estrutura.test.cjs` `o package-lock resolve o n8n-workflow em 2.46.5 ou mais nova` | yes |
| C5 | `estrutura.test.cjs` `a categoria do node é aceita pelo lint oficial` | yes |
| C6 | `npm test` | yes - comando |
| C7 | `estrutura.test.cjs` `o workflow de CI roda ci, lint, test e build no Pull Request` | yes - apertado para exigir `run: <comando>` (F8) |
| C8 | `campos-v2.test.cjs` `v1 publishVideo envia finalVideoId numérico e socialAccountId em texto` | yes |
| C9 | `campos-v2.test.cjs` `v1 generateCaption envia o finalVideoId numérico para /ai-social` | yes |
| C10 | `campos-v2.test.cjs` `v1 expõe todo parâmetro da 1.0.0 com o mesmo name e type` | yes - o gate @version do projectId social ganhou C33 (F1) |
| C11 | `campos-v2.test.cjs` `v1 recusa finalVideoId 0 com a mensagem da 1.0.0` | yes |
| C12 | `campos-v2.test.cjs` `o node nasce na versão 2 e mantém a 1` | yes |
| C13 | `campos-v2.test.cjs` `finalVideoId e socialAccountId são Resource Locator com lista e ID na v2` | yes |
| C14 | `campos-v2.test.cjs` `a v2 pede o projectId nas operações sociais de legenda e publicação` | yes |
| C15 | `campos-v2.test.cjs` `searchVideos lista videos[] do projeto com título cortado e duração` | yes - mutações M5, M6 e M9 falham |
| C16 | `campos-v2.test.cjs` `searchVideos devolve results vazio quando videos[] não vem` | yes |
| C17 | `campos-v2.test.cjs` `searchVideos nomeia o vídeo sem título como Video <id>` | yes |
| C18 | `campos-v2.test.cjs` `searchVideos devolve vazio, sem erro, com o projeto em processamento` | yes |
| C19 | `campos-v2.test.cjs` `searchVideos não chama a API com projectId vazio` | yes |
| C20 | `campos-v2.test.cjs` `searchSocialAccounts lista publishAccounts[] como plataforma - usuário` | yes |
| C21 | `campos-v2.test.cjs` `as duas listas filtram pelo texto sem diferenciar maiúscula` | yes |
| C22 | `campos-v2.test.cjs` `modo list entrega o finalVideoId como número` | yes |
| C23 | `campos-v2.test.cjs` `modo id tira o espaço das pontas do socialAccountId` | yes |
| C24 | `campos-v2.test.cjs` `finalVideoId "abc" lança a mensagem de inteiro positivo` | yes - `0x1F` e `1e3` ganharam C34 (F2) |
| C25 | `campos-v2.test.cjs` `socialAccountId vazio lança Social Account ID is required` | yes |
| C26 | `campos-v2.test.cjs` `o node continua utilizável como tool de IA` e `valor de expressão em texto puro também é aceito no finalVideoId` | yes |
| C27 | `campos-v2.test.cjs` `v1 publishVideo com chave inválida lança NodeApiError`, `as duas listas da v2 propagam a chave inválida como NodeApiError` e `erro HTTP 401 do transporte vira NodeApiError na lista e na publicação (F6)` | yes - 4001 e HTTP 401 |
| C28 | `lancamento.test.cjs` `o package.json está na 1.1.0 e traz o funding do dono` | yes |
| C29 | `lancamento.test.cjs` `o CHANGELOG tem a seção 1.1.0 com os três assuntos` | yes - regex de palavra, aceito (baixo). Revisor independente: falha se a seção ou uma das três palavras sumir, mas não falha com uma frase que negue o assunto (nit F2 da the-judge, aceito sem mudança) (julgado por revisor independente, não pelo autor) |
| C30 | `lancamento.test.cjs` `o publish.yml publica por stage, com a mesma versão de Node do ci.yml` | yes |
| C31 | `lancamento.test.cjs` `o README segue o padrão completo do dono` | yes - selo exigido completo (F8). Revisor independente: o teste só conferia os títulos; o commit da rodada 2 acrescenta a variável `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`, o `$fromAI(` e a seção `Boas práticas` (red antes do README, green depois; F1 da the-judge) (julgado por revisor independente, não pelo autor) |
| C32 | walk - aprovação do dono no npm depois da tag | n/a - walk |
| C33 | `campos-v2.test.cjs` `o projectId social não aparece na v1 (F1)` | yes - falha com a afirmação falsa: tirar o gate `@version` do `projectId` social em `properties.ts` deixa o teste vermelho (mutação rodada pelo revisor) (julgado por revisor independente, não pelo autor) |
| C34 | `campos-v2.test.cjs` `finalVideoId só aceita dígitos: 0x1F e 1e3 são recusados (F2)` | yes - falha com a afirmação falsa: trocar a regex `^\d+$` por `Number(rawVideoId)` em `execute.ts` deixa o teste vermelho; ele cobre `0x1F`, `1e3`, `1.5` e `-4` (julgado por revisor independente, não pelo autor) |
| C35 | `campos-v2.test.cjs` `o corte do título não deixa emoji pela metade (F3)` | yes - falha com a afirmação falsa: trocar `Array.from(title).slice` por `title.slice` corta o emoji ao meio e deixa o teste vermelho (59 letras mais dois emojis) (julgado por revisor independente, não pelo autor) |
| C36 | `campos-v2.test.cjs` `duração nula ou zero não mostra o sufixo de segundos (F4)` | yes - falha com a afirmação falsa: trocar `duration > 0` por `true` deixa o teste vermelho (2 falhas, com `null` e com `0`) (julgado por revisor independente, não pelo autor) |
| C37 | `campos-v2.test.cjs` `vídeo sem videoId é descartado da lista (F5)` | yes - falha com a afirmação falsa: tirar o filtro de `videoId` deixa o teste vermelho (julgado por revisor independente, não pelo autor) |
| C38 | `campos-v2.test.cjs` `o projectId é codificado na rota da lista (F7)` | yes - falha com a afirmação falsa: trocar `encodeURIComponent(projectId)` por `projectId` deixa o teste vermelho (`a/b?x=1` exige `/query/a%2Fb%3Fx%3D1`) (julgado por revisor independente, não pelo autor) |
| C39 | `estrutura.test.cjs` `o workflow de CI roda ci, lint, test e build no Pull Request` e `lancamento.test.cjs` `o README segue o padrão completo do dono` | yes - o CI exige o texto `run: <comando>` dos quatro passos e o README exige o selo completo, as 14 seções e, desde a rodada 2, a variável de Tool de IA, o `$fromAI(` e `Boas práticas` (julgado por revisor independente, não pelo autor) |

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| F1 sem teste do gate `@version` do `projectId` social | mutação M1 sobrevivia | teste `o projectId social não aparece na v1` | 3b9fe2d - C33 |
| F2 `0x1F` e `1e3` viravam número | sondas P6 e P7 | regex `^\d+$` antes do `Number()` em `execute.ts` | 3b9fe2d - C34 |
| F3 emoji cortado ao meio | sonda P2 | `Array.from(title).slice(0, 60)` | 3b9fe2d - C35 |
| F4 duração nula ou zero mostrava `(0 s)` | sondas P1 e P1b | sufixo só com duração maior que zero | 3b9fe2d - C36 |
| F5 vídeo sem `videoId` virava `"undefined"` | sonda P4 | descarta o item sem `videoId` | 3b9fe2d - C37 |
| F6 HTTP 401 do transporte sem teste | `grep httpCode test/` vazio | teste com `httpCode` 401 na lista e na publicação | 3b9fe2d - C27 |
| F7 `encodeURIComponent` sem teste | mutação M3 sobrevivia | teste com `a/b?x=1` | 3b9fe2d - C38 |
| F8 asserções frouxas (C7, C31) | leitura dos testes | CI exige `run: <comando>`; README exige o selo completo | 3b9fe2d - C39 |
| F9 cabeçalho do `proofs.md` divergia da saída | `proofs.md` linhas 6 e 60-63 | `check_proofs.py` regerado em 3b9fe2d: 46 pass, 0 fail | 3b9fe2d - C6 |
| F10 plano 401 contra checks 4001 | `plan.md` Surface e `checks.md` C27 | C27 cobre o código 4001 e o HTTP 401 | 3b9fe2d - C27 |
