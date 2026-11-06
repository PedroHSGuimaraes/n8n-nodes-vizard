/*
 * Testes das rotas novas da Vizard (plano .specs/features/rotas-novas/plan.md):
 * publicação em várias contas, resultado da publicação, apagar projeto,
 * clipModel e as fontes Dropbox e Instagram.
 *
 * Os testes rodam sobre o dist e usam um contexto falso que grava a requisição
 * HTTP, sem chamar a rede. Cada teste nomeia a regra que protege: se o código
 * mudar o contrato, o teste certo fica vermelho.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const {
	executeSocialOperation,
	executeVideoOperation,
} = require('../dist/nodes/Vizard/actions/execute');
const { actionProperties } = require('../dist/nodes/Vizard/actions/properties');
const { Vizard } = require('../dist/nodes/Vizard/Vizard.node');

// Contexto falso de execução: lê parâmetros de um objeto e guarda cada requisição.
function executionContext(parameters, responder) {
	const requests = [];
	const context = {
		requests,
		getNode: () => ({ name: 'Vizard', type: 'vizard', typeVersion: 2 }),
		getNodeParameter: (name, _itemIndex, defaultValue) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : defaultValue,
		getInputData: () => [{ json: {} }],
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: async (_credentialType, options) => {
				requests.push(options);
				return responder ? responder(options) : { code: 2000 };
			},
		},
	};
	return context;
}

// Linha de conta no formato que o n8n grava na coleção com Resource Locator.
const account = (value, mode = 'id') => ({ accountId: { mode, value } });

// Parâmetros mínimos e válidos da publicação em várias contas.
function batchParameters(extra = {}) {
	return {
		socialAccounts: { accounts: [account('111', 'list'), account(' 222 ')] },
		videoUrl: 'https://cdn.example.com/clip.mp4',
		post: 'Texto do post',
		...extra,
	};
}

// Procura uma propriedade pelo nome dentro da lista do node (e opcionalmente pela operação).
function findProperty(name, operation) {
	return actionProperties.find(
		(property) =>
			property.name === name &&
			(!operation || property.displayOptions?.show?.operation?.includes(operation)),
	);
}

describe('Publicação em várias contas', () => {
	it('publishToMultipleAccounts envia socialAccountIds separados por vírgula com timeout de 30 s', async () => {
		const context = executionContext(batchParameters());
		await executeSocialOperation.call(context, 'publishToMultipleAccounts', 0);

		const [request] = context.requests;
		assert.equal(request.method, 'POST');
		assert.equal(request.url, '/batch-publish-video');
		assert.equal(request.timeout, 30000);
		assert.deepEqual(request.body, {
			socialAccountIds: '111,222',
			videoUrl: 'https://cdn.example.com/clip.mp4',
			post: 'Texto do post',
		});
	});

	it('publishToMultipleAccounts remove repetidos e espaços dos IDs', async () => {
		const context = executionContext(
			batchParameters({
				socialAccounts: { accounts: [account('111'), account(' 111 '), account('222')] },
			}),
		);
		await executeSocialOperation.call(context, 'publishToMultipleAccounts', 0);
		assert.equal(context.requests[0].body.socialAccountIds, '111,222');
	});

	it('publishToMultipleAccounts envia title e publishTime em milissegundos', async () => {
		const context = executionContext(
			batchParameters({
				batchPublishingOptions: { title: 'Meu vídeo', publishTime: '2026-12-01T10:00:00Z' },
			}),
		);
		await executeSocialOperation.call(context, 'publishToMultipleAccounts', 0);
		assert.equal(context.requests[0].body.title, 'Meu vídeo');
		assert.equal(context.requests[0].body.publishTime, 1796119200000);
	});

	it('publishToMultipleAccounts recusa lista de contas vazia', async () => {
		// Três formas de "nenhuma conta": coleção ausente, sem linhas e só com valores vazios.
		for (const socialAccounts of [undefined, { accounts: [] }, { accounts: [account('  ')] }]) {
			const context = executionContext(batchParameters({ socialAccounts }));
			await assert.rejects(
				executeSocialOperation.call(context, 'publishToMultipleAccounts', 0),
				/Select at least one social account/,
			);
			assert.equal(context.requests.length, 0);
		}
	});

	it('publishToMultipleAccounts recusa ID de conta com vírgula', async () => {
		const context = executionContext(
			batchParameters({ socialAccounts: { accounts: [account('111,222')] } }),
		);
		await assert.rejects(
			executeSocialOperation.call(context, 'publishToMultipleAccounts', 0),
			/Social account IDs cannot contain commas/,
		);
		assert.equal(context.requests.length, 0);
	});

	it('publishToMultipleAccounts recusa post vazio', async () => {
		const context = executionContext(batchParameters({ post: '   ' }));
		await assert.rejects(
			executeSocialOperation.call(context, 'publishToMultipleAccounts', 0),
			/Post is required/,
		);
		assert.equal(context.requests.length, 0);
	});

	it('publishToMultipleAccounts recusa videoUrl que não é http nem https', async () => {
		const context = executionContext(batchParameters({ videoUrl: 'ftp://x/y.mp4' }));
		await assert.rejects(
			executeSocialOperation.call(context, 'publishToMultipleAccounts', 0),
			/Video URL must be an absolute HTTP or HTTPS URL/,
		);
		assert.equal(context.requests.length, 0);
	});

	it('publishToMultipleAccounts transforma o código 4011 em NodeApiError', async () => {
		const context = executionContext(batchParameters(), () => ({ code: 4011 }));
		await assert.rejects(
			executeSocialOperation.call(context, 'publishToMultipleAccounts', 0),
			// O n8n troca a mensagem de um NodeApiError com código 4xxx; o texto da Vizard fica na descrição.
			(error) =>
				error.name === 'NodeApiError' && error.description === 'The social account ID is invalid.',
		);
	});

	it('a coleção socialAccounts usa Resource Locator com lista e ID', () => {
		const collection = findProperty('socialAccounts', 'publishToMultipleAccounts');
		assert.equal(collection.type, 'fixedCollection');
		assert.equal(collection.typeOptions.multipleValues, true);
		const accountsOption = collection.options.find((option) => option.name === 'accounts');
		const locator = accountsOption.values.find((value) => value.name === 'accountId');
		assert.equal(locator.type, 'resourceLocator');
		assert.equal(locator.default.mode, 'list');
		assert.deepEqual(
			locator.modes.map((mode) => mode.name),
			['list', 'id'],
		);
		assert.equal(locator.modes[0].typeOptions.searchListMethod, 'searchSocialAccounts');

		// A descrição da operação avisa que a publicação vai para todas as contas escolhidas.
		const operation = actionProperties
			.find(
				(p) => p.name === 'operation' && p.displayOptions.show.resource[0] === 'socialPublishing',
			)
			.options.find((option) => option.value === 'publishToMultipleAccounts');
		assert.match(operation.description, /every selected account/i);
	});
});

describe('Resultado da publicação', () => {
	it('getPublishResult chama GET /publish-result com o ID codificado e timeout de 30 s', async () => {
		const first = executionContext({ customVideoId: 'abc-123' });
		await executeSocialOperation.call(first, 'getPublishResult', 0);
		assert.equal(first.requests[0].method, 'GET');
		assert.equal(first.requests[0].url, '/publish-result/abc-123');
		assert.equal(first.requests[0].timeout, 30000);

		// Caracteres especiais não podem quebrar a rota nem escapar dela.
		const second = executionContext({ customVideoId: 'a/b c' });
		await executeSocialOperation.call(second, 'getPublishResult', 0);
		assert.equal(second.requests[0].url, '/publish-result/a%2Fb%20c');
	});

	it('getPublishResult recusa customVideoId vazio', async () => {
		for (const customVideoId of ['', '   ']) {
			const context = executionContext({ customVideoId });
			await assert.rejects(
				executeSocialOperation.call(context, 'getPublishResult', 0),
				/Custom Video ID is required/,
			);
			assert.equal(context.requests.length, 0);
		}
	});

	it('customVideoId tem a descrição do plano', () => {
		assert.equal(
			findProperty('customVideoId').description,
			'Video file ID generated from the Video URL of a multi-account publish',
		);
	});
});

describe('IDs que escapam da rota', () => {
	it('getPublishResult e deleteProject recusam . e .. como ID', async () => {
		// "." e ".." passam pelo encodeURIComponent e o URL os resolve para fora da rota
		// (DELETE /delete/.. viraria uma chamada à raiz do projeto).
		for (const id of ['.', '..']) {
			const result = executionContext({ customVideoId: id });
			await assert.rejects(
				executeSocialOperation.call(result, 'getPublishResult', 0),
				/Custom Video ID is not valid/,
			);
			assert.equal(result.requests.length, 0);

			const del = executionContext({ projectId: id, confirmDelete: true });
			await assert.rejects(
				executeVideoOperation.call(del, 'deleteProject', 0),
				/Project ID is not valid/,
			);
			assert.equal(del.requests.length, 0);
		}
	});
});

describe('Apagar projeto', () => {
	it('deleteProject chama DELETE /delete com confirmação ligada', async () => {
		const context = executionContext({ projectId: '17861706', confirmDelete: true });
		await executeVideoOperation.call(context, 'deleteProject', 0);
		assert.equal(context.requests[0].method, 'DELETE');
		assert.equal(context.requests[0].url, '/delete/17861706');
		assert.equal(context.requests[0].timeout, 30000);
	});

	it('deleteProject devolve success true quando a resposta vem vazia', async () => {
		// Passa pelo execute do node: é ele que transforma resposta vazia em { success: true }.
		const context = executionContext(
			{
				resource: 'videoProject',
				operation: 'deleteProject',
				projectId: '17861706',
				confirmDelete: true,
			},
			() => '',
		);
		const [items] = await new Vizard().execute.call(context);
		assert.deepEqual(items[0].json, { success: true });
	});

	it('deleteProject sem confirmação falha antes de qualquer requisição', async () => {
		// Desligado e ausente (padrão do getNodeParameter) precisam dar o mesmo erro.
		for (const parameters of [
			{ projectId: '17861706', confirmDelete: false },
			{ projectId: '17861706' },
		]) {
			const context = executionContext(parameters);
			await assert.rejects(
				executeVideoOperation.call(context, 'deleteProject', 0),
				/Confirm Delete must be enabled to delete a project/,
			);
			assert.equal(context.requests.length, 0);
		}
	});

	it('deleteProject com projectId vazio falha com Project ID is required', async () => {
		const context = executionContext({ projectId: '  ', confirmDelete: true });
		await assert.rejects(
			executeVideoOperation.call(context, 'deleteProject', 0),
			/Project ID is required/,
		);
		assert.equal(context.requests.length, 0);
	});

	it('confirmDelete é boolean desligado e a operação avisa com Warning:', () => {
		const confirm = findProperty('confirmDelete');
		assert.equal(confirm.type, 'boolean');
		assert.equal(confirm.default, false);
		// A regra do lint do n8n obriga o campo booleano a começar com "Whether"; o aviso fica na operação.
		assert.match(confirm.description, /^Whether/);

		const operation = actionProperties
			.find((p) => p.name === 'operation' && p.displayOptions.show.resource[0] === 'videoProject')
			.options.find((option) => option.value === 'deleteProject');
		assert.match(operation.description, /^Warning:/);
	});

	it('projectId de deleteProject é texto obrigatório', () => {
		const projectId = actionProperties.find(
			(p) => p.name === 'projectId' && p.displayOptions?.show?.operation?.includes('deleteProject'),
		);
		assert.equal(projectId.type, 'string');
		assert.equal(projectId.required, true);
	});
});

describe('Campos novos de POST /create', () => {
	// Parâmetros comuns de uma submissão de clipes.
	const clipParameters = (additionalFields) => ({
		videoUrl: 'https://www.youtube.com/watch?v=example',
		videoType: 2,
		lang: 'en',
		preferLength: [0],
		additionalFields,
	});

	it('createClips envia clipModel clip_v2', async () => {
		const context = executionContext(clipParameters({ clipModel: 'clip_v2' }));
		await executeVideoOperation.call(context, 'createClips', 0);
		assert.equal(context.requests[0].body.clipModel, 'clip_v2');
	});

	it('createClips sem clipModel não envia a chave', async () => {
		const context = executionContext(clipParameters({}));
		await executeVideoOperation.call(context, 'createClips', 0);
		assert.equal('clipModel' in context.requests[0].body, false);
	});

	it('clipModel tem clip_v1 padrão e avisa o custo 1.25 times', () => {
		const createClips = actionProperties.find(
			(p) => p.name === 'additionalFields' && p.displayOptions.show.operation[0] === 'createClips',
		);
		const clipModel = createClips.options.find((option) => option.name === 'clipModel');
		assert.equal(clipModel.default, 'clip_v1');
		assert.deepEqual(
			clipModel.options.map((option) => option.value),
			['clip_v1', 'clip_v2'],
		);
		assert.match(clipModel.description, /1\.25 times/);
	});

	it('videoType tem Dropbox 13 e Instagram 14 e não envia ext', async () => {
		const videoType = findProperty('videoType');
		const names = videoType.options.map((option) => option.name);
		assert.equal(names[names.indexOf('LinkedIn') + 1], 'Dropbox');
		assert.equal(names[names.indexOf('LinkedIn') + 2], 'Instagram');
		assert.equal(videoType.options.find((o) => o.name === 'Dropbox').value, 13);
		assert.equal(videoType.options.find((o) => o.name === 'Instagram').value, 14);

		// O tipo 13 é plataforma: não pede extensão de arquivo (só o tipo 1 pede).
		const context = executionContext({ ...clipParameters({}), videoType: 13 });
		await executeVideoOperation.call(context, 'createClips', 0);
		assert.equal(context.requests[0].body.videoType, 13);
		assert.equal('ext' in context.requests[0].body, false);
	});
});

describe('Erros da Vizard nas rotas novas', () => {
	it('as três operações novas transformam o código 4001 em NodeApiError', async () => {
		// Tabela com as três rotas: cada uma precisa converter o código de chave inválida.
		const cases = [
			['social', 'publishToMultipleAccounts', batchParameters()],
			['social', 'getPublishResult', { customVideoId: 'abc' }],
			['video', 'deleteProject', { projectId: '1', confirmDelete: true }],
		];
		for (const [kind, operation, parameters] of cases) {
			const context = executionContext(parameters, () => ({ code: 4001 }));
			const run = kind === 'social' ? executeSocialOperation : executeVideoOperation;
			await assert.rejects(
				run.call(context, operation, 0),
				(error) => error.name === 'NodeApiError' && error.description === 'Invalid API key.',
			);
		}
	});
});

describe('Compatibilidade e lançamento 1.2.0', () => {
	it('todo parâmetro da 1.1.0 mantém name e type', () => {
		// A fixture foi gerada do build de origin/main (1.1.0) antes das mudanças. Cada entrada
		// precisa ter um par atual com o mesmo name, type, required, recurso e @version; a lista
		// de operações (show.operation e opções de "operation") só pode crescer, nunca encolher.
		const baseline = JSON.parse(
			fs.readFileSync(path.join(__dirname, 'fixtures', 'propriedades-1.1.0.json'), 'utf8'),
		);
		const contains = (atual = [], antigo = []) => antigo.every((valor) => atual.includes(valor));
		for (const old of baseline) {
			const match = actionProperties.find((property) => {
				if (property.name !== old.name || property.type !== old.type) return false;
				if (Boolean(property.required) !== old.required) return false;
				const show = property.displayOptions?.show ?? {};
				if (JSON.stringify(show.resource) !== JSON.stringify(old.show.resource)) return false;
				if (JSON.stringify(show['@version']) !== JSON.stringify(old.show['@version'])) return false;
				if (!contains(show.operation, old.show.operation)) return false;
				if (
					old.values &&
					!contains(
						property.options?.map((o) => o.value),
						old.values,
					)
				)
					return false;
				return true;
			});
			assert.ok(match, `${old.name} (${old.type}) sumiu, mudou de tipo ou perdeu uma condição`);
		}
	});

	it('a v1 ganha só os cinco parâmetros das operações novas', () => {
		// Trava o conjunto de extras: parâmetro novo fora desta lista precisa de decisão explícita.
		const baseline = JSON.parse(
			fs.readFileSync(path.join(__dirname, 'fixtures', 'propriedades-1.1.0.json'), 'utf8'),
		);
		const antigos = new Set(baseline.map((p) => p.name));
		const extras = new Set(actionProperties.filter((p) => !antigos.has(p.name)).map((p) => p.name));
		assert.deepEqual([...extras].sort(), [
			'batchPublishingOptions',
			'confirmDelete',
			'customVideoId',
			'post',
			'socialAccounts',
		]);
	});

	it('o pacote está na 1.2.0 com CHANGELOG e README das operações novas', () => {
		const root = path.join(__dirname, '..');
		const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
		assert.equal(pkg.version, '1.2.0');

		const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
		assert.match(changelog, /^## 1\.2\.0 /m);
		for (const word of ['batch-publish-video', 'publish-result', 'delete', 'clipModel']) {
			assert.match(changelog, new RegExp(word));
		}

		const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
		for (const word of [
			'Publish To Multiple Accounts',
			'Get Publish Result',
			'Delete Project',
			'Clip Model',
		]) {
			assert.match(readme, new RegExp(word));
		}
		// Tabela de operações: uma linha de tabela por operação nova.
		for (const operation of [
			'Publish To Multiple Accounts',
			'Get Publish Result',
			'Delete Project',
		]) {
			assert.match(readme, new RegExp(`^\\| ${operation} +\\|`, 'm'));
		}
		// Exemplo de cada operação nova e seção de Tool de IA citando as operações.
		assert.match(readme, /### Publicar em várias contas/);
		assert.match(readme, /### Apagar um projeto/);
		assert.match(readme, /### Escolher o modelo de clipes/);
		const tool = readme.split('## 🤖 Usar como Tool de Agente de IA')[1].split('## 🧪 Exemplos')[0];
		assert.match(tool, /Publish To Multiple Accounts/);
		assert.match(tool, /Get Publish Result/);
		assert.match(tool, /Delete Project/);
	});

	it('o node continua usableAsTool', () => {
		assert.equal(new Vizard().description.usableAsTool, true);
	});
});
