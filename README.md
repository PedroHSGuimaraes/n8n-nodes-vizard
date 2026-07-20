# n8n-nodes-vizard

Node comunitário do n8n para a API oficial do **Vizard AI**. Edita vídeos curtos, cria clipes de vídeos longos, consulta resultados, gera legendas sociais e publica vídeos em contas conectadas.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-vizard.svg)](https://www.npmjs.com/package/n8n-nodes-vizard)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-vizard.svg)](https://www.npmjs.com/package/n8n-nodes-vizard)
[![CI](https://github.com/PedroHSGuimaraes/n8n-nodes-vizard/actions/workflows/ci.yml/badge.svg)](https://github.com/PedroHSGuimaraes/n8n-nodes-vizard/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/n8n-nodes-vizard.svg)](LICENSE.md)

## Funcionalidades

- Edição guiada de vídeos com menos de 3 minutos.
- Legendas, headline, emojis, palavras destacadas, B-roll e remoção de silêncio.
- Templates pessoais e do Brand Kit.
- Clipping automático de vídeos longos com duração e quantidade configuráveis.
- Consulta de status e vídeos gerados.
- Geração de copy social com plataforma, tom e voz configuráveis.
- Listagem de contas sociais e publicação imediata ou agendada.
- Compatibilidade com AI Agent por `usableAsTool: true`.
- Tratamento dos códigos de erro retornados no corpo JSON pela Vizard.
- Sem dependências de runtime.

## Instalação

Na interface do n8n, acesse **Settings → Community Nodes**, escolha **Install a community node** e informe:

```text
n8n-nodes-vizard
```

Em instalação self-hosted via npm:

```bash
cd ~/.n8n
npm install n8n-nodes-vizard
```

## Credencial

1. Entre na conta Vizard com plano pago.
2. Abra **Workspace Settings → API**.
3. Gere e copie a API Key.
4. No n8n, crie uma credencial **Vizard API** e cole a chave.
5. Use **Test credential** para validar o acesso.

A chave fica na credencial criptografada do n8n e é enviada somente no header `VIZARDAI_API_KEY`.

## Operações

### Video Project

| Operação                     | Uso                                                                        |
| ---------------------------- | -------------------------------------------------------------------------- |
| Edit Short Video             | Edita vídeo menor que 3 minutos com `getClips: 0` definido automaticamente |
| Create Clips From Long Video | Gera clipes sociais a partir de vídeo longo                                |
| Get Project Output           | Consulta processamento e retorna os vídeos gerados pelo `projectId`        |

### Social Publishing

| Operação               | Uso                                                            |
| ---------------------- | -------------------------------------------------------------- |
| Get Connected Accounts | Lista contas conectadas e seus IDs                             |
| Generate AI Caption    | Gera texto social a partir de um `videoId` que contenha fala   |
| Publish Video          | Publica agora ou agenda um vídeo em uma conta social conectada |

## Editar vídeo curto

1. Escolha **Video Project → Edit Short Video**.
2. Informe a URL pública e selecione a origem correta.
3. Para arquivo remoto, escolha `mp4`, `3gp`, `avi` ou `mov`.
4. Escolha o idioma falado ou **Auto Detect**.
5. Em **Additional Fields**, adicione apenas os recursos desejados.
6. Execute o node e guarde o `projectId`.
7. Use **Get Project Output**. Enquanto `code` for `1000`, aguarde e consulte novamente; `2000` indica resultado pronto.

O vídeo de entrada em modo de edição deve ter menos de 3 minutos. O link de download retornado em `videoUrl` expira após 7 dias; consulte o projeto novamente para obter um link atualizado.

## Criar clipes de vídeo longo

Em **Preferred Clip Lengths**, selecione uma ou mais faixas. **Auto** não pode ser combinado com outra faixa. Campos opcionais permitem limitar o resultado a 1–100 clipes ou orientar o modelo com tópicos e momentos desejados.

A Vizard limita submissões de vídeos longos a 3 por minuto e 20 por hora por padrão. O node não faz tentativas automáticas para evitar submissões duplicadas.

## Publicação segura

Publicar vídeo altera sistemas externos. Antes de executar **Publish Video**:

1. Use **Get Connected Accounts** e confirme o destino.
2. Revise o `finalVideoId`, texto, título e horário.
3. Exija aprovação humana quando a operação estiver conectada a um AI Agent.

Se **Publish Time** não for informado, a publicação acontece imediatamente.

## AI Agent

Em instalações self-hosted, habilite nodes comunitários como tools:

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

Use uma operação por tool e nomes estreitos, por exemplo `Vizard_Edit_Short_Video` ou `Vizard_Get_Project`. Não exponha a operação **Publish Video** sem confirmação humana.

## Desenvolvimento

```bash
npm install
npm run format
npm run lint
npm test
```

## Documentação oficial

- [Quickstart e autenticação](https://docs.vizard.ai/docs/quickstart)
- [Editar vídeo curto](https://docs.vizard.ai/docs/submit-a-short-video-for-editing)
- [Consultar vídeos gerados](https://docs.vizard.ai/docs/retrieve-video-clips)
- [Gerar AI social caption](https://docs.vizard.ai/docs/generate-ai-social-caption)
- [Publicar em redes sociais](https://docs.vizard.ai/docs/publish-clips-to-social-media)
- [Rate limits](https://docs.vizard.ai/docs/rate-limit)

## Licença

[MIT](LICENSE.md)
