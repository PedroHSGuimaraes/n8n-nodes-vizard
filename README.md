# n8n-nodes-vizard

Node comunitário do [n8n](https://n8n.io/) para a API oficial do **[Vizard AI](https://vizard.ai/)**. Edita vídeos curtos, cria clipes de vídeos longos, consulta resultados, gera legendas sociais e publica vídeos em contas conectadas.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-vizard.svg)](https://www.npmjs.com/package/n8n-nodes-vizard)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-vizard.svg)](https://www.npmjs.com/package/n8n-nodes-vizard)
[![CI](https://github.com/PedroHSGuimaraes/n8n-nodes-vizard/actions/workflows/ci.yml/badge.svg)](https://github.com/PedroHSGuimaraes/n8n-nodes-vizard/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/n8n-nodes-vizard.svg)](LICENSE.md)
[![Apoie no Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-Apoie_o_projeto-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/qTny0AzFXS)

[n8n](https://n8n.io/) é uma plataforma de automação de fluxos com [licença fair-code](https://docs.n8n.io/reference/license/).

[Funcionalidades](#-funcionalidades) · [Instalação](#-instalação) · [Credenciais](#-credenciais) · [Nós e Operações](#-nós-e-operações) · [Tool de IA](#-usar-como-tool-de-agente-de-ia) · [Exemplos](#-exemplos) · [Desenvolvimento](#️-desenvolvimento) · [Versões](#-versões) · [Apoie](#-apoie-o-projeto)

---

## 🚀 Funcionalidades

- **Edição guiada** de vídeos com menos de 3 minutos: legendas, headline, emojis, palavras destacadas, B-roll e remoção de silêncio.
- **Templates** pessoais e do Brand Kit pelo `templateId`.
- **Clipping automático** de vídeos longos, com duração e quantidade configuráveis.
- **Consulta** de status e dos vídeos gerados.
- **Copy social** com plataforma, tom e voz configuráveis.
- **Publicação** imediata ou agendada em contas conectadas.
- **Lista de vídeos e lista de contas sociais** (versão 2 do node): você escolhe o vídeo do projeto e a conta social por nome, sem copiar IDs. Também dá para colar o ID.
- **Usável como Tool de IA**: o node expõe `usableAsTool: true`.
- **Erros claros**: os códigos de erro que a Vizard devolve no corpo JSON viram erros do node.
- **Zero dependências de runtime** e publicação no npm **com provenance**.

## 📦 Instalação

Na interface do n8n, acesse **Settings → Community Nodes**, escolha **Install a community node** e informe:

```text
n8n-nodes-vizard
```

Em instalação self-hosted via npm:

```bash
cd ~/.n8n
npm install n8n-nodes-vizard
```

## 🔑 Credenciais

1. Entre na conta Vizard com plano pago.
2. Abra **Workspace Settings → API**.
3. Gere e copie a API Key.
4. No n8n, crie uma credencial **Vizard API** e cole a chave.
5. Use **Test credential** para validar o acesso.

A chave fica na credencial criptografada do n8n e é enviada somente no header `VIZARDAI_API_KEY`.

## 🧩 Nós e Operações

O node `Vizard` tem dois recursos.

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

### Escolher o vídeo e a conta (versão 2)

Em **Generate AI Caption** e **Publish Video**, o node pede o **Project ID** (o ID devolvido quando o vídeo foi enviado). Com ele preenchido, o campo **Final Video** mostra a **lista de vídeos** do projeto, com título e duração, e você escolhe um. O modo **By ID** aceita colar o `videoId` ou uma expressão.

Em **Publish Video**, o campo **Social Account** mostra a **lista de contas sociais** conectadas ao workspace (`plataforma - usuário`). O modo **By ID** aceita colar o ID.

Se o projeto ainda estiver em processamento, a lista de vídeos fica vazia até a Vizard terminar. A Vizard não oferece rota para listar projetos nem templates, então **Project ID** e **Template ID** continuam sendo preenchidos à mão.

## 🤖 Usar como Tool de Agente de IA

O node `Vizard` é **usável como tool** por nós de **AI Agent** do n8n (Tools Agent). Isso deixa o modelo **executar ações no seu Vizard sozinho** — por exemplo: _"edite o vídeo https://exemplo.com/video.mp4 e me devolva o projectId"_.

### Como ligar (2 passos)

1. **No servidor n8n**, habilite o uso de community nodes como tools (por segurança, vem **desligado por padrão**). Defina a variável de ambiente:

   ```bash
   N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
   ```

   | Instalação                  | Onde definir                                                                                            |
   | --------------------------- | ------------------------------------------------------------------------------------------------------- |
   | **Docker / docker-compose** | Adicione em `environment:` do serviço n8n (ou no `.env`) e recrie o container (`docker compose up -d`). |
   | **npm / npx**               | Exporte antes de subir: `export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true && n8n start`.             |
   | **n8n Cloud**               | Já habilitado nos planos que suportam community nodes.                                                  |

   > Sem essa variável o node **não aparece** na lista de tools do AI Agent — é a causa nº 1 de "não acho o node como tool".

2. **No workflow**, adicione um node **AI Agent**, conecte um **Chat Model** e, no conector **Tool**, adicione o **Vizard**. Escolha o **Recurso** e a **Operação** que o agente pode usar (ex.: Video Project → Edit Short Video). Uma tool por operação é a prática recomendada, com nomes estreitos como `Vizard_Edit_Short_Video` ou `Vizard_Get_Project`.

### Deixe o modelo preencher os campos (`$fromAI`)

Em cada campo do node em modo tool aparece o botão **"Let the model define this"**, que usa a expressão. Exemplos neste pacote:

```
Edit Short Video, campo Video URL:
{{ $fromAI('videoUrl', 'URL pública do vídeo a editar, com menos de 3 minutos', 'string') }}

Generate AI Caption (versão 2), campo Project ID:
{{ $fromAI('projectId', 'ID do projeto devolvido quando o vídeo foi enviado', 'string') }}

Publish Video (versão 2), campo Final Video, modo By ID:
{{ $fromAI('finalVideoId', 'videoId do vídeo gerado, só dígitos', 'string') }}
```

- Assinatura: `$fromAI(key, description?, type?, defaultValue?)` — `key` de 1–64 caracteres (`[a-zA-Z0-9_-]`); `type` = `string` | `number` | `boolean` | `json`.
- Os campos **Final Video** e **Social Account** têm dois modos. O agente preenche o modo **By ID**; a lista do editor serve a quem monta o workflow à mão.
- Você pode **misturar**: fixar alguns campos (ex.: sempre a mesma conta social) e deixar o modelo preencher outros.
- Quanto mais específico o seu prompt ou a System Message do agente, melhor o resultado.

### Boas práticas

- **Restrinja o escopo:** exponha só as operações que o agente precisa (ex.: só _Get Project Output_), em vez de liberar tudo.
- **Cuidado:** publicar altera sistemas externos. Não exponha **Publish Video** a um agente sem confirmação humana.
- **Credencial dedicada** com permissões mínimas para o agente.
- **n8n atualizado:** versões antigas tinham um bug em que a tool de community node retornava resposta vazia para o agente ([n8n#26202](https://github.com/n8n-io/n8n/issues/26202)); já corrigido.

### Referências

- [Tools Agent — n8n Docs](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent)
- [Let AI specify tool parameters (`$fromAI`) — n8n Docs](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/)
- [Variáveis de ambiente de nodes — n8n Docs](https://docs.n8n.io/hosting/configuration/environment-variables/nodes/)

## 🧪 Exemplos

### Editar um vídeo curto

1. Escolha **Video Project → Edit Short Video**.
2. Informe a URL pública e selecione a origem correta.
3. Para arquivo remoto, escolha `mp4`, `3gp`, `avi` ou `mov`.
4. Escolha o idioma falado ou **Auto Detect**.
5. Em **Additional Fields**, adicione apenas os recursos desejados.
6. Execute o node e guarde o `projectId`.
7. Use **Get Project Output**. Enquanto `code` for `1000`, aguarde e consulte novamente; `2000` indica resultado pronto.

O vídeo de entrada em modo de edição deve ter menos de 3 minutos. O link de download retornado em `videoUrl` expira após 7 dias; consulte o projeto novamente para obter um link atualizado.

### Criar clipes de vídeo longo

Em **Preferred Clip Lengths**, selecione uma ou mais faixas. **Auto** não pode ser combinado com outra faixa. Campos opcionais permitem limitar o resultado a 1–100 clipes ou orientar o modelo com tópicos e momentos desejados.

A Vizard limita submissões de vídeos longos a 3 por minuto e 20 por hora por padrão. O node não faz tentativas automáticas para evitar submissões duplicadas.

### Publicar com segurança

1. Use **Get Connected Accounts** (ou a lista de **Social Account**) e confirme o destino.
2. Escolha o vídeo na lista de **Final Video**.
3. Revise texto, título e horário.
4. Exija aprovação humana quando a operação estiver conectada a um AI Agent.

Se **Publish Time** não for informado, a publicação acontece imediatamente.

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar (n8n-node build)
npm run build

# Testes (node --test sobre o dist)
npm test

# Lint oficial do n8n (n8n-node lint)
npm run lint
npm run lint:fix

# Modo watch
npm run dev
```

Estrutura resumida:

```
n8n-nodes-vizard/
├── credentials/             # VizardApi (API Key)
├── nodes/Vizard/
│   ├── actions/             # propriedades e execução das operações
│   ├── helpers/             # leitura única do ID (texto ou Resource Locator)
│   ├── methods/             # teste da credencial e listas do editor
│   └── transport/           # chamada autenticada à API da Vizard
├── test/                    # node --test sobre o dist
└── .specs/                  # plano, decisões e checks (TLC)
```

## ✅ Compatibilidade

- Requer n8n com `n8nNodesApiVersion` 1.
- API da Vizard: `https://elb-api.vizard.ai/hvizard-server-front/open-api/v1/project`.
- **Atualizando da 1.0.0:** workflows salvos continuam na versão 1 do node, com os mesmos campos. Node novo nasce na versão 2.

## 📚 Recursos

- [Documentação de community nodes do n8n](https://docs.n8n.io/integrations/community-nodes/)
- [Quickstart e autenticação](https://docs.vizard.ai/docs/quickstart)
- [Editar vídeo curto](https://docs.vizard.ai/docs/submit-a-short-video-for-editing)
- [Consultar vídeos gerados](https://docs.vizard.ai/docs/retrieve-video-clips)
- [Contas sociais conectadas](https://docs.vizard.ai/docs/retrieve-social-accounts)
- [Gerar AI social caption](https://docs.vizard.ai/docs/generate-ai-social-caption)
- [Publicar em redes sociais](https://docs.vizard.ai/docs/publish-clips-to-social-media)
- [Rate limits](https://docs.vizard.ai/docs/rate-limit)

## 🚀 Publicação

A tag `vX.Y.Z` dispara o workflow `publish.yml`, que envia a versão com `npm stage publish` e provenance. A versão **fica em espera**: ela só vai ao ar depois que o dono a aprova, com 2FA, na aba **Staged Packages** do npmjs.com. Sem a aprovação, nada muda no registro.

## 📈 Versões

- **1.1.0** — **Lista de vídeos e de contas sociais.** Em node novo (versão 2 do node), **Final Video** e **Social Account** mostram uma lista pesquisável e aceitam colar o ID; as operações sociais pedem o **Project ID**. Workflows salvos continuam na versão 1 e não mudam. Migração para o `@n8n/node-cli` 0.55.5 com lint oficial sem erros, categoria corrigida para `Marketing & Content`, `n8n-workflow` `^2.46.5` e publicação por `stage`.
- **1.0.0** — Primeira versão: edição guiada, clipping, consulta de projeto, legendas sociais, contas conectadas e publicação.

## 🆘 Suporte

Se algo não funcionar:

1. Confirme se a **API Key** está correta e se o plano da Vizard tem acesso à API.
2. Verifique se a versão do n8n é compatível.
3. Consulte os logs do n8n para o código de erro da Vizard.
4. Abra uma [issue no GitHub](https://github.com/PedroHSGuimaraes/n8n-nodes-vizard/issues).

## ☕ Apoie o projeto

Este node é mantido de forma independente. Se ele ajuda suas automações, você pode apoiar o desenvolvimento, a manutenção e as novas integrações pelo [Buy Me a Coffee](https://buymeacoffee.com/qTny0AzFXS).

## 📄 Licença

[MIT](LICENSE.md)
