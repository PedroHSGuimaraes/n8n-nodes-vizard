# rotas-novas verification

**Verdict**: PASS (rejulgado por revisor independente, não pelo autor: os 4 achados abaixo foram conferidos contra `d0733d3` com mutações que deixam um teste vermelho, e os checks C23 e C25, que estavam `no`, foram rejulgados)
**Proofs**: `proofs.md` at HEAD (rodado de novo depois do fix d0733d3 e da correção de Get Project Output)
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `rotas-novas.test.cjs` `publishToMultipleAccounts envia socialAccountIds separados por vírgula com timeout de 30 s` | yes - `deepEqual` do corpo inteiro, method, url e timeout |
| C2 | `rotas-novas.test.cjs` `publishToMultipleAccounts remove repetidos e espaços dos IDs` | yes - repetido com espaço colapsa para `111,222` |
| C3 | `rotas-novas.test.cjs` `publishToMultipleAccounts envia title e publishTime em milissegundos` | yes - valor exato 1796119200000; só um caso de data |
| C4 | `rotas-novas.test.cjs` `publishToMultipleAccounts recusa lista de contas vazia` | yes - 3 formas de vazio, mensagem e 0 requisições |
| C5 | `rotas-novas.test.cjs` `publishToMultipleAccounts recusa ID de conta com vírgula` | yes |
| C6 | `rotas-novas.test.cjs` `publishToMultipleAccounts recusa post vazio` | yes - usa só espaços |
| C7 | `rotas-novas.test.cjs` `publishToMultipleAccounts recusa videoUrl que não é http nem https` | yes - só `ftp://`; o código reusa `videoUrl()` |
| C8 | `rotas-novas.test.cjs` `publishToMultipleAccounts transforma o código 4011 em NodeApiError` | yes - checa `name` e `description` |
| C9 | `rotas-novas.test.cjs` `a coleção socialAccounts usa Resource Locator com lista e ID` | yes |
| C10 | `rotas-novas.test.cjs` `getPublishResult chama GET /publish-result com o ID codificado e timeout de 30 s` | yes para `abc-123` e `a/b c`; não cobre `.` e `..` (ver F1) |
| C11 | `rotas-novas.test.cjs` `getPublishResult recusa customVideoId vazio` | yes - vazio e só espaços |
| C12 | `rotas-novas.test.cjs` `customVideoId tem a descrição do plano` | yes - igualdade exata |
| C13 | `rotas-novas.test.cjs` `deleteProject chama DELETE /delete com confirmação ligada` | yes |
| C14 | `rotas-novas.test.cjs` `deleteProject devolve success true quando a resposta vem vazia` | yes - passa por `Vizard.execute` |
| C15 | `rotas-novas.test.cjs` `deleteProject sem confirmação falha antes de qualquer requisição` | yes - `false` e ausente; no meu exemplo `'true'` e `1` também são recusados |
| C16 | `rotas-novas.test.cjs` `deleteProject com projectId vazio falha com Project ID is required` | yes |
| C17 | `rotas-novas.test.cjs` `confirmDelete é boolean desligado e a operação avisa com Warning:` | yes |
| C18 | `rotas-novas.test.cjs` `projectId de deleteProject é texto obrigatório` | yes |
| C19 | `rotas-novas.test.cjs` `createClips envia clipModel clip_v2` | yes |
| C20 | `rotas-novas.test.cjs` `createClips sem clipModel não envia a chave` | yes |
| C21 | `rotas-novas.test.cjs` `clipModel tem clip_v1 padrão e avisa o custo 1.25 times` | yes - só olha `createClips` |
| C22 | `rotas-novas.test.cjs` `videoType tem Dropbox 13 e Instagram 14 e não envia ext` | yes - posição depois de LinkedIn, valores e ausência de `ext` |
| C23 | `rotas-novas.test.cjs` `todo parâmetro da 1.1.0 mantém name e type` | yes - rejulgado: depois de `d0733d3` o teste compara tipo, `required`, recurso, `@version`, as operações e os valores das opções contra a fixture de `origin/main`. Mutação: trocar `value: 'getProject'` por `getProjectX` no seletor de operação deixa o teste vermelho. Conferi também por build que todo parâmetro antigo continua igual na v1 e na v2 (rejulgado por revisor independente, não pelo autor) |
| C24 | `campos-v2.test.cjs` `v1 publishVideo envia finalVideoId numérico e socialAccountId em texto` | yes - corpo exato com contexto `typeVersion` 1 |
| C25 | `rotas-novas.test.cjs` `o pacote está na 1.2.0 com CHANGELOG e README das operações novas` | yes - rejulgado: depois de `d0733d3` o teste exige a linha de tabela de cada operação nova, os três títulos de exemplo e a seção de Tool de IA com as operações. Mutação: renomear a linha `Delete Project` da tabela deixa o teste vermelho. Limite: as palavras do CHANGELOG (`delete`, `clipModel`) seguem frouxas (rejulgado por revisor independente, não pelo autor) |
| C26 | `rotas-novas.test.cjs` `o node continua usableAsTool` | yes |
| C27 | `npm run lint` (prova solo, código de saída) | yes - exit 0 em `proofs.md` |
| C28 | `rotas-novas.test.cjs` `as três operações novas transformam o código 4001 em NodeApiError` | yes - as 3 rotas por tabela; o `401` HTTP é código existente de `vizardApiRequest` |
| C29 | `rotas-novas.test.cjs` `getPublishResult e deleteProject recusam . e .. como ID` | yes - `.` e `..` nas duas rotas, sem requisição (conferido pelo exemplo F1 do Verifier). Mutação do revisor: trocar a condição de `routeId` por `false` deixa o teste vermelho (julgado por revisor independente, não pelo autor) |
| C30 | `rotas-novas.test.cjs` `getProject recusa . e .. como Project ID sem chamar a API` e `getProject segue chamando GET /query com um ID comum` | yes - escrito pelo revisor na correção pedida pelo orquestrador; visto vermelho antes (2 falhas) e verde depois. A mesma mutação de `routeId` o deixa vermelho (julgado por revisor independente, não pelo autor) |
| C31 | `rotas-novas.test.cjs` `a lista de vídeos devolve vazio, sem chamar a API, para . e .. como Project ID` | yes - visto vermelho antes e verde depois; assere `{ results: [] }` e 0 requisições para `.` e `..` (julgado por revisor independente, não pelo autor) |

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| F1: `customVideoId` ou `projectId` igual a `.` ou `..` escapa da rota; no delete a requisição vira `DELETE` na raiz do recurso | exemplo descartável `/tmp/verifier-vizard/own.test.cjs`: `customVideoId '..'` gera url `/publish-result/..`; `projectId '..'` gera `DELETE /delete/..` e `'.'` gera `/delete/.`. `encodeURIComponent` não codifica ponto, e `new URL('<base>/delete/..')` resolve para `.../v1/project/` (`/delete/.` para `.../project/delete/`). `?x=1`, `#` e `/` ficam codificados (`%3F`, `%23`, `%2F`). O `getProject` existente tem o mesmo defeito, mas o delete é destrutivo | recusar `.` e `..` (ou codificar o ponto como `%2E`) em `customVideoId` e `projectId`, com teste de regressão para `.` e `..` nas duas rotas | d0733d3 - `routeId` recusa `.` e `..`; C29 `getPublishResult e deleteProject recusam . e .. como ID` |
| F2: C23 não pega alteração em parâmetro de nome repetido | `test/rotas-novas.test.cjs:356` aceita qualquer propriedade com o mesmo `name` e `type`; a fixture tem `operation:options` x2, `additionalFields:collection` x2, `projectId:string` x2. Mutações sobre o `dist`: trocar o tipo de um `operation` para `string` segue verde; remover o seletor de `operation` de `videoProject` segue verde; esconder `finalVideoId` com outro `displayOptions` segue verde. Renomear `lang` ou trocar o seu tipo fica vermelho. A chave `show` da fixture não é lida e os valores das operações da 1.1.0 não são comparados | comparar por multiconjunto (cada linha da fixture consome uma propriedade igual) e comparar também `show` e os `value` das opções de `operation` | d0733d3 - C23 compara tipo, required, recurso, @version e operações da fixture regenerada de origin/main; mutação de `operation` para string ficou vermelha |
| F3: a mudança em `campos-v2.test.cjs` afrouxou o teste da v1 além do necessário | `test/campos-v2.test.cjs:104-108` trocou `deepEqual` por inclusão; qualquer parâmetro extra na v1 passa. Os extras legítimos são exatamente 5: `confirmDelete`, `socialAccounts`, `post`, `batchPublishingOptions`, `customVideoId`. A troca em `lancamento.test.cjs` (`^1\.[1-9]\d*\.\d+$`) é legítima, porque C25 fixa `1.2.0` | manter a comparação exata, subtraindo só a lista dos 5 nomes novos | d0733d3 - teste `a v1 ganha só os cinco parâmetros das operações novas` trava os 5 extras |
| F4: C25 não prova o que S5 AC3 pede do README | `test/rotas-novas.test.cjs:375-382` só confere que o README contém 4 palavras; tabela de operações, um exemplo de cada operação e a seção de Tool de IA não têm asserção. No `CHANGELOG`, a regex `delete` é genérica | asserir no README a linha de tabela de cada operação nova, o título do exemplo de cada uma e a seção de Tool de IA com as 3 operações | d0733d3 - C25 confere linhas da tabela, os três exemplos e a seção de Tool de IA |

Exemplos descartáveis que passaram (sem achado): `socialAccounts` com ID numérico (`123`, `0`, linha como número puro) vira texto; `post` só com espaços é recusado; `publishTime` `not-a-date` é recusado antes da requisição; `projectId` `a/b` vira `a%2Fb`; `confirmDelete` `'true'` e `1` são recusados. Notas sem teste: `title` só com espaços é enviado; `publishTime` numérico (epoch em ms) é recusado como data inválida, igual ao `publishVideo`; linha `null` em `accounts` lança `TypeError` em vez de `NodeOperationError`; a ordem de validação (contas, URL, `post`) não tem teste; `clipModel` forjado à mão em Edit Short Video é repassado.
