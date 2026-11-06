/*
 * Testes da versão 2 do node Vizard (campos guiados) e da compatibilidade
 * com a versão 1.
 *
 * O que protegem: (1) workflow salvo na versão 1 envia a mesma requisição da
 * 1.0.0; (2) em node novo (versão 2) o vídeo e a conta social saem de listas
 * pesquisáveis (Resource Locator), lidas da API da Vizard, com opção de colar
 * o ID. Cada teste vem de um critério das fatias S2 e S3 do plan.md em
 * .specs/features/node-cli-campos-v2.
 */
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { Vizard } = require('../dist/nodes/Vizard/Vizard.node');
const { executeSocialOperation } = require('../dist/nodes/Vizard/actions/execute');

const node = new Vizard();
const propriedades = node.description.properties;

// Contexto falso de execução: devolve os parâmetros dados e grava a requisição HTTP.
function contextoExecucao(parametros, responder, typeVersion = 2) {
	return {
		getNode: () => ({ name: 'Vizard', type: 'vizard', typeVersion }),
		getNodeParameter: (nome, _item, padrao) =>
			Object.prototype.hasOwnProperty.call(parametros, nome) ? parametros[nome] : padrao,
		helpers: {
			httpRequestWithAuthentication: async (_credencial, opcoes) => responder(opcoes),
		},
	};
}

// Contexto falso do editor (listSearch): lê parâmetros pelo getCurrentNodeParameter.
function contextoLista(parametros, responder) {
	return {
		getNode: () => ({ name: 'Vizard', type: 'vizard', typeVersion: 2 }),
		getCurrentNodeParameter: (nome) => parametros[nome],
		helpers: {
			httpRequestWithAuthentication: async (_credencial, opcoes) => responder(opcoes),
		},
	};
}

// Parâmetros que a 1.0.0 expunha, como "nome:tipo" (foto tirada da 1.0.0).
const parametrosDaVersao1 = [
	'additionalFields:collection',
	'aiSocialPlatform:options',
	'ext:options',
	'finalVideoId:number',
	'lang:options',
	'operation:options',
	'preferLength:multiOptions',
	'projectId:string',
	'publishingOptions:collection',
	'resource:options',
	'socialAccountId:string',
	'tone:options',
	'videoType:options',
	'videoUrl:string',
	'voice:options',
];

// Um parâmetro vale na versão 1 quando não filtra por @version ou lista a 1.
function visivelNaVersao1(p) {
	const versoes = p.displayOptions?.show?.['@version'];
	return !versoes || versoes.includes(1);
}

describe('Versão 1 continua igual à 1.0.0', () => {
	it('v1 publishVideo envia finalVideoId numérico e socialAccountId em texto', async () => {
		let requisicao;
		const ctx = contextoExecucao(
			{ finalVideoId: 14015572, socialAccountId: '123456' },
			(o) => {
				requisicao = o;
				return { code: 2000 };
			},
			1,
		);
		await executeSocialOperation.call(ctx, 'publishVideo', 0);
		assert.equal(requisicao.method, 'POST');
		assert.equal(requisicao.url, '/publish-video');
		assert.deepEqual(requisicao.body, { finalVideoId: 14015572, socialAccountId: '123456' });
	});

	it('v1 generateCaption envia o finalVideoId numérico para /ai-social', async () => {
		let requisicao;
		const ctx = contextoExecucao(
			{ finalVideoId: 14015572, aiSocialPlatform: 1, tone: 0, voice: 0 },
			(o) => {
				requisicao = o;
				return { code: 2000 };
			},
			1,
		);
		await executeSocialOperation.call(ctx, 'generateCaption', 0);
		assert.equal(requisicao.url, '/ai-social');
		assert.equal(requisicao.body.finalVideoId, 14015572);
	});

	it('v1 expõe todo parâmetro da 1.0.0 com o mesmo name e type', () => {
		const naV1 = [
			...new Set(propriedades.filter(visivelNaVersao1).map((p) => `${p.name}:${p.type}`)),
		];
		assert.deepEqual(naV1.sort(), parametrosDaVersao1);
	});

	it('v1 recusa finalVideoId 0 com a mensagem da 1.0.0', async () => {
		const ctx = contextoExecucao({ finalVideoId: 0 }, () => ({ code: 2000 }), 1);
		await assert.rejects(
			executeSocialOperation.call(ctx, 'generateCaption', 0),
			/Final Video ID must be a positive integer/,
		);
	});
});

describe('Versão 2: campos guiados', () => {
	it('o node nasce na versão 2 e mantém a 1', () => {
		assert.deepEqual(node.description.version, [1, 2]);
		assert.equal(node.description.defaultVersion, 2);
	});

	it('finalVideoId e socialAccountId são Resource Locator com lista e ID na v2', () => {
		const naV2 = (nome) =>
			propriedades.find((p) => p.name === nome && p.type === 'resourceLocator');
		const video = naV2('finalVideoId');
		const conta = naV2('socialAccountId');
		assert.ok(video && conta, 'falta o resourceLocator na v2');
		assert.deepEqual(video.displayOptions.show.operation, ['generateCaption', 'publishVideo']);
		assert.deepEqual(conta.displayOptions.show.operation, ['publishVideo']);
		for (const [campo, metodo] of [
			[video, 'searchVideos'],
			[conta, 'searchSocialAccounts'],
		]) {
			assert.equal(campo.default.mode, 'list');
			assert.equal(campo.required, true);
			const lista = campo.modes.find((m) => m.name === 'list');
			const porId = campo.modes.find((m) => m.name === 'id');
			assert.equal(lista.type, 'list');
			assert.equal(lista.typeOptions.searchListMethod, metodo);
			assert.equal(lista.typeOptions.searchable, true);
			assert.equal(porId.type, 'string');
		}
	});

	it('a v2 pede o projectId nas operações sociais de legenda e publicação', () => {
		const projeto = propriedades.find(
			(p) => p.name === 'projectId' && p.displayOptions?.show?.resource?.[0] === 'socialPublishing',
		);
		assert.ok(projeto, 'falta o projectId social');
		assert.equal(projeto.required, true);
		assert.deepEqual(projeto.displayOptions.show.operation, ['generateCaption', 'publishVideo']);
		assert.equal(
			projeto.description,
			'Project that holds the video; use the ID returned when the video was submitted',
		);
	});

	it('o node continua utilizável como tool de IA', () => {
		assert.equal(node.description.usableAsTool, true);
	});
});

describe('Versão 2: listas do editor', () => {
	const { searchVideos, searchSocialAccounts } = node.methods.listSearch;

	it('searchVideos lista videos[] do projeto com título cortado e duração', async () => {
		let requisicao;
		const ctx = contextoLista({ projectId: '17861706' }, (o) => {
			requisicao = o;
			return {
				code: 2000,
				videos: [
					{ videoId: 1, title: 'A'.repeat(70), videoMsDuration: 80400 },
					{ videoId: 2, title: 'Curto', videoMsDuration: 5000 },
				],
			};
		});
		const resultado = await searchVideos.call(ctx);
		assert.equal(requisicao.method, 'GET');
		assert.equal(requisicao.url, '/query/17861706');
		assert.equal(requisicao.timeout, 30000);
		assert.deepEqual(resultado.results, [
			{ name: `${'A'.repeat(60)} (80 s)`, value: '1' },
			{ name: 'Curto (5 s)', value: '2' },
		]);
	});

	it('searchVideos devolve results vazio quando videos[] não vem', async () => {
		const ctx = contextoLista({ projectId: '17861706' }, () => ({ code: 2000 }));
		assert.deepEqual((await searchVideos.call(ctx)).results, []);
	});

	it('searchVideos nomeia o vídeo sem título como Video <id>', async () => {
		const ctx = contextoLista({ projectId: '1' }, () => ({
			code: 2000,
			videos: [{ videoId: 9, videoMsDuration: 3000 }],
		}));
		assert.deepEqual((await searchVideos.call(ctx)).results, [
			{ name: 'Video 9 (3 s)', value: '9' },
		]);
	});

	it('searchVideos devolve vazio, sem erro, com o projeto em processamento (código 1000)', async () => {
		const ctx = contextoLista({ projectId: '17861706' }, () => ({ code: 1000 }));
		assert.deepEqual((await searchVideos.call(ctx)).results, []);
	});

	it('searchVideos não chama a API com projectId vazio', async () => {
		let chamou = false;
		const ctx = contextoLista({ projectId: '   ' }, () => {
			chamou = true;
			return {};
		});
		assert.deepEqual((await searchVideos.call(ctx)).results, []);
		assert.equal(chamou, false);
	});

	it('searchSocialAccounts lista publishAccounts[] como plataforma - usuário', async () => {
		let requisicao;
		const ctx = contextoLista({}, (o) => {
			requisicao = o;
			return {
				publishAccounts: [
					{ id: '1', platform: 'Instagram', username: 'maria', page: 'pagina' },
					{ id: '2', platform: 'YouTube', username: '', page: 'Canal X' },
				],
				total: 2,
			};
		});
		const resultado = await searchSocialAccounts.call(ctx);
		assert.equal(requisicao.url, '/social-accounts');
		assert.equal(requisicao.timeout, 30000);
		assert.deepEqual(resultado.results, [
			{ name: 'Instagram - maria', value: '1' },
			{ name: 'YouTube - Canal X', value: '2' },
		]);
	});

	it('as duas listas filtram pelo texto sem diferenciar maiúscula', async () => {
		const contas = contextoLista({}, () => ({
			publishAccounts: [
				{ id: '1', platform: 'Instagram', username: 'maria' },
				{ id: '2', platform: 'TikTok', username: 'joao' },
			],
		}));
		assert.deepEqual((await searchSocialAccounts.call(contas, 'INSTA')).results, [
			{ name: 'Instagram - maria', value: '1' },
		]);
		const videos = contextoLista({ projectId: '1' }, () => ({
			code: 2000,
			videos: [
				{ videoId: 1, title: 'Promo de Verão', videoMsDuration: 1000 },
				{ videoId: 2, title: 'Bastidores', videoMsDuration: 1000 },
			],
		}));
		assert.deepEqual((await searchVideos.call(videos, 'verão')).results, [
			{ name: 'Promo de Verão (1 s)', value: '1' },
		]);
	});
});

describe('Versão 2: execução lê o Resource Locator', () => {
	it('modo list entrega o finalVideoId como número', async () => {
		let requisicao;
		const ctx = contextoExecucao(
			{
				finalVideoId: { mode: 'list', value: '14015572' },
				socialAccountId: { mode: 'list', value: '123456' },
			},
			(o) => {
				requisicao = o;
				return { code: 2000 };
			},
		);
		await executeSocialOperation.call(ctx, 'publishVideo', 0);
		assert.strictEqual(requisicao.body.finalVideoId, 14015572);
	});

	it('modo id tira o espaço das pontas do socialAccountId', async () => {
		let requisicao;
		const ctx = contextoExecucao(
			{
				finalVideoId: { mode: 'id', value: '14015572' },
				socialAccountId: { mode: 'id', value: ' 123456 ' },
			},
			(o) => {
				requisicao = o;
				return { code: 2000 };
			},
		);
		await executeSocialOperation.call(ctx, 'publishVideo', 0);
		assert.strictEqual(requisicao.body.socialAccountId, '123456');
	});

	it('valor de expressão em texto puro também é aceito no finalVideoId', async () => {
		let requisicao;
		const ctx = contextoExecucao(
			{ finalVideoId: '14015572', aiSocialPlatform: 1, tone: 0, voice: 0 },
			(o) => {
				requisicao = o;
				return { code: 2000 };
			},
		);
		await executeSocialOperation.call(ctx, 'generateCaption', 0);
		assert.strictEqual(requisicao.body.finalVideoId, 14015572);
	});

	it('finalVideoId "abc" lança a mensagem de inteiro positivo', async () => {
		const ctx = contextoExecucao({ finalVideoId: { mode: 'id', value: 'abc' } }, () => ({
			code: 2000,
		}));
		await assert.rejects(
			executeSocialOperation.call(ctx, 'generateCaption', 0),
			/Final Video ID must be a positive integer/,
		);
	});

	it('socialAccountId vazio lança Social Account ID is required', async () => {
		const ctx = contextoExecucao(
			{
				finalVideoId: { mode: 'id', value: '14015572' },
				socialAccountId: { mode: 'id', value: '' },
			},
			() => ({ code: 2000 }),
		);
		await assert.rejects(
			executeSocialOperation.call(ctx, 'publishVideo', 0),
			/Social Account ID is required/,
		);
	});
});

describe('Chave inválida da Vizard (código 4001)', () => {
	const { searchVideos, searchSocialAccounts } = node.methods.listSearch;
	const { NodeApiError } = require('n8n-workflow');

	it('v1 publishVideo com chave inválida lança NodeApiError', async () => {
		// A Vizard responde 200 com code 4001; o node precisa transformar em erro.
		const ctx = contextoExecucao(
			{ finalVideoId: 14015572, socialAccountId: '1' },
			() => ({ code: 4001 }),
			1,
		);
		await assert.rejects(executeSocialOperation.call(ctx, 'publishVideo', 0), NodeApiError);
	});

	it('as duas listas da v2 propagam a chave inválida como NodeApiError', async () => {
		const ctxVideos = contextoLista({ projectId: '1' }, () => ({ code: 4001 }));
		const ctxContas = contextoLista({}, () => ({ code: 4001 }));
		await assert.rejects(searchVideos.call(ctxVideos), NodeApiError);
		await assert.rejects(searchSocialAccounts.call(ctxContas), NodeApiError);
	});
});

describe('Achados do Verifier fechados', () => {
	const { searchVideos } = node.methods.listSearch;
	const { NodeApiError } = require('n8n-workflow');

	it('o projectId social não aparece na v1 (F1)', () => {
		// Sem o gate @version o campo viraria obrigatório em workflows salvos.
		const sociais = propriedades.filter(
			(p) => p.name === 'projectId' && p.displayOptions?.show?.resource?.[0] === 'socialPublishing',
		);
		assert.ok(sociais.length > 0);
		assert.ok(sociais.every((p) => !visivelNaVersao1(p)));
	});

	it('finalVideoId só aceita dígitos: 0x1F e 1e3 são recusados (F2)', async () => {
		for (const valor of ['0x1F', '1e3', '1.5', '-4']) {
			const ctx = contextoExecucao(
				{ finalVideoId: { mode: 'id', value: valor }, aiSocialPlatform: 1, tone: 0, voice: 0 },
				() => ({ code: 2000 }),
			);
			await assert.rejects(
				executeSocialOperation.call(ctx, 'generateCaption', 0),
				/Final Video ID must be a positive integer/,
				valor,
			);
		}
	});

	it('o corte do título não deixa emoji pela metade (F3)', async () => {
		const titulo = `${'a'.repeat(59)}😀😀`;
		const ctx = contextoLista({ projectId: '1' }, () => ({
			code: 2000,
			videos: [{ videoId: 1, title: titulo, videoMsDuration: 2000 }],
		}));
		const [item] = (await searchVideos.call(ctx)).results;
		assert.equal(item.name, `${'a'.repeat(59)}😀 (2 s)`);
	});

	it('duração nula ou zero não mostra o sufixo de segundos (F4)', async () => {
		const ctx = contextoLista({ projectId: '1' }, () => ({
			code: 2000,
			videos: [
				{ videoId: 1, title: 'Nulo', videoMsDuration: null },
				{ videoId: 2, title: 'Zero', videoMsDuration: 0 },
			],
		}));
		assert.deepEqual((await searchVideos.call(ctx)).results, [
			{ name: 'Nulo', value: '1' },
			{ name: 'Zero', value: '2' },
		]);
	});

	it('vídeo sem videoId é descartado da lista (F5)', async () => {
		const ctx = contextoLista({ projectId: '1' }, () => ({
			code: 2000,
			videos: [
				{ title: 'Sem id', videoMsDuration: 1000 },
				{ videoId: 7, title: 'Com id' },
			],
		}));
		assert.deepEqual((await searchVideos.call(ctx)).results, [{ name: 'Com id', value: '7' }]);
	});

	it('erro HTTP 401 do transporte vira NodeApiError na lista e na publicação (F6)', async () => {
		const falha = () => {
			throw Object.assign(new Error('Unauthorized'), { httpCode: '401' });
		};
		await assert.rejects(searchVideos.call(contextoLista({ projectId: '1' }, falha)), NodeApiError);
		const ctx = contextoExecucao(
			{
				finalVideoId: { mode: 'id', value: '14015572' },
				socialAccountId: { mode: 'id', value: '1' },
			},
			falha,
		);
		await assert.rejects(executeSocialOperation.call(ctx, 'publishVideo', 0), NodeApiError);
	});

	it('o projectId é codificado na rota da lista (F7)', async () => {
		let requisicao;
		const ctx = contextoLista({ projectId: 'a/b?x=1' }, (o) => {
			requisicao = o;
			return { code: 2000 };
		});
		await searchVideos.call(ctx);
		assert.equal(requisicao.url, '/query/a%2Fb%3Fx%3D1');
	});
});
