# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | O pacote usa o `@n8n/node-cli` 0.55.5 para build e lint (`n8n-node build`, `n8n-node lint`), com `n8n.strict: true`, sem gulp, sem config própria de ESLint e sem `dependencies` de runtime | A guideline de verificação do n8n manda usar a ferramenta `n8n-node`. Menu: "Migrar para node-cli" (Jev 0,96) | active | 2026-11-06 |
| AD-002 | Mudança de formato de parâmetro entra como versão leve do node (`version: [1, 2]`, `defaultVersion` 2, `@version` em `displayOptions`); a versão 1 mantém nome e tipo de todo parâmetro | Workflows salvos não podem quebrar. Menu: "Nova versão do node" (Jev 0,83) | active | 2026-11-06 |
| AD-003 | A entrega é branch, Pull Request, merge na `main` e tag `vX.Y.Z`, que publica no npm pelo `publish.yml` com provenance | Menu: "PR e publicar" | active | 2026-11-06 |
| AD-004 | A publicação usa `npx -y npm@12.2.2 stage publish --provenance --access public` no lugar de `npm run release`: a versão fica em espera e o dono a aprova com 2FA na aba Staged Packages do npmjs.com | O token granular do npm é "Read and write (stage only)"; com ele `npm publish` falha com `E_STAGE_REQUIRED`. `npm stage` só existe no npm 12 e o Node 24 do runner traz o npm 11. Decisão do dono, 06/11/2026 | active | 2026-11-06 |
| AD-005 | A devDependency `n8n-workflow` sobe de `^2.16.0` para `^2.46.5` e o lock fica em 2.46.x ou mais nova; o `peerDependencies` continua `*` | A tag `latest` do npm está parada em 2.16.0; a `stable` é 2.46.5. Peer aberto segue o template oficial. Decisão do dono, 06/11/2026 | active | 2026-11-06 |
| AD-006 | O README segue o padrão completo do `Rd Station Node/README.md` e o `package.json` leva `funding` com `https://buymeacoffee.com/qTny0AzFXS` | Decisão do dono, 06/11/2026: todo pacote n8n publicado leva a documentação completa | active | 2026-11-06 |
| AD-007 | O seletor de Final Video ID da versão 2 é um Resource Locator que lista os vídeos do projeto informado em Project ID, lendo `videos[]` de `GET /query/{projectId}` | A doc da Vizard não tem rota que liste vídeos fora de um projeto. Menu: "Como guiar o Final Video ID" → lista por projeto (Jev 0,97; descartadas: manter número 0,01, só expressão 0,02) | active | 2026-11-06 |
| AD-008 | O nome do pacote continua `n8n-nodes-vizard`; nenhum pacote existente tem o nome igual sem pontuação (`npm view n8nnodesvizard` devolve E404) | O npm recusa com E400 no stage um nome igual a outro sem pontuação | active | 2026-11-06 |
