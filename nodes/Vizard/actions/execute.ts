import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { getIdParameter, readLocatorValue } from '../helpers/resourceLocator';
import { VIZARD_ROUTE_TIMEOUT_MS, vizardApiRequest } from '../transport';

const switchFields = [
	'autoBrollSwitch',
	'emojiSwitch',
	'highlightSwitch',
	'headlineSwitch',
	'removeSilenceSwitch',
	'subtitleSwitch',
] as const;

function hasOwn(source: IDataObject, name: string): boolean {
	return Object.prototype.hasOwnProperty.call(source, name);
}

function requiredText(
	context: IExecuteFunctions,
	name: string,
	itemIndex: number,
	displayName: string,
): string {
	const value = String(context.getNodeParameter(name, itemIndex, '')).trim();
	if (value) return value;
	throw new NodeOperationError(context.getNode(), `${displayName} is required`, { itemIndex });
}

function videoUrl(context: IExecuteFunctions, itemIndex: number): string {
	const value = requiredText(context, 'videoUrl', itemIndex, 'Video URL');
	try {
		const parsed = new URL(value);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value;
	} catch {
		// The operation error below gives workflow authors one stable validation message.
	}
	throw new NodeOperationError(
		context.getNode(),
		'Video URL must be an absolute HTTP or HTTPS URL',
		{ itemIndex },
	);
}

function appendAdditionalFields(body: IDataObject, additionalFields: IDataObject): void {
	// clipModel só existe em Create Clips; ausente, a Vizard usa clip_v1 sozinha.
	for (const name of [
		'keywords',
		'maxClipNumber',
		'projectName',
		'ratioOfClip',
		'templateId',
		'clipModel',
	]) {
		if (!hasOwn(additionalFields, name)) continue;
		const value = additionalFields[name];
		if (value !== '') body[name] = value;
	}
	for (const name of switchFields) {
		if (hasOwn(additionalFields, name)) body[name] = additionalFields[name] ? 1 : 0;
	}
}

function submissionBody(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: 'editShortVideo' | 'createClips',
): IDataObject {
	const sourceType = context.getNodeParameter('videoType', itemIndex) as number;
	const body: IDataObject = {
		lang: context.getNodeParameter('lang', itemIndex) as string,
		videoType: sourceType,
		videoUrl: videoUrl(context, itemIndex),
	};

	if (sourceType === 1) body.ext = requiredText(context, 'ext', itemIndex, 'File Extension');
	if (operation === 'editShortVideo') {
		body.getClips = 0;
	} else {
		const preferLength = (context.getNodeParameter('preferLength', itemIndex) as unknown[]).map(
			Number,
		);
		if (!preferLength.length) {
			throw new NodeOperationError(context.getNode(), 'Select at least one preferred clip length', {
				itemIndex,
			});
		}
		if (preferLength.includes(0) && preferLength.length > 1) {
			throw new NodeOperationError(
				context.getNode(),
				'Auto clip length cannot be combined with another preferred clip length',
				{ itemIndex },
			);
		}
		body.preferLength = preferLength;
	}

	const additionalFields = context.getNodeParameter(
		'additionalFields',
		itemIndex,
		{},
	) as IDataObject;
	appendAdditionalFields(body, additionalFields);
	return body;
}

export async function executeVideoOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<unknown> {
	if (operation === 'editShortVideo' || operation === 'createClips') {
		return await vizardApiRequest.call(this, 'POST', '/create', {
			body: submissionBody(this, itemIndex, operation),
		});
	}
	if (operation === 'getProject') {
		const projectId = requiredText(this, 'projectId', itemIndex, 'Project ID');
		return await vizardApiRequest.call(this, 'GET', `/query/${encodeURIComponent(projectId)}`, {
			allowedCodes: [1000, 2000],
		});
	}
	if (operation === 'deleteProject') {
		// Apagar é irreversível: sem a confirmação ligada, nada sai do node (nem a leitura do ID).
		// O padrão false cobre o caso do parâmetro ausente, como em workflows montados à mão.
		if (this.getNodeParameter('confirmDelete', itemIndex, false) !== true) {
			throw new NodeOperationError(
				this.getNode(),
				'Confirm Delete must be enabled to delete a project',
				{ itemIndex },
			);
		}
		const projectId = requiredText(this, 'projectId', itemIndex, 'Project ID');
		return await vizardApiRequest.call(this, 'DELETE', `/delete/${encodeURIComponent(projectId)}`, {
			timeout: VIZARD_ROUTE_TIMEOUT_MS,
		});
	}
	throw new NodeOperationError(this.getNode(), `Unsupported video operation: ${operation}`, {
		itemIndex,
	});
}

function scheduledPublishTime(
	context: IExecuteFunctions,
	value: unknown,
	itemIndex: number,
): number | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	const timestamp = new Date(String(value)).getTime();
	if (Number.isFinite(timestamp)) return timestamp;
	throw new NodeOperationError(context.getNode(), 'Publish Time must be a valid date and time', {
		itemIndex,
	});
}

// Lê as contas da coleção "Social Accounts" e devolve os IDs prontos para o corpo do batch:
// sem espaço nas pontas, sem repetição (a ordem da primeira aparição fica) e sem vírgula,
// porque a vírgula é o separador que a Vizard recebe (a doc só diz "string", sem exemplo).
function batchAccountIds(context: IExecuteFunctions, itemIndex: number): string {
	const collection = context.getNodeParameter('socialAccounts', itemIndex, {}) as IDataObject;
	const rows = Array.isArray(collection?.accounts) ? (collection.accounts as IDataObject[]) : [];
	const ids = new Set<string>();
	for (const row of rows) {
		const id = readLocatorValue(row.accountId);
		// Linha vazia (conta ainda não escolhida) é ignorada; se sobrar nada, o erro abaixo avisa.
		if (!id) continue;
		if (id.includes(',')) {
			throw new NodeOperationError(context.getNode(), 'Social account IDs cannot contain commas', {
				itemIndex,
			});
		}
		ids.add(id);
	}
	if (!ids.size) {
		throw new NodeOperationError(context.getNode(), 'Select at least one social account', {
			itemIndex,
		});
	}
	return Array.from(ids).join(',');
}

// Publica um vídeo em várias contas (POST /batch-publish-video). Valida tudo antes da requisição.
async function publishToMultipleAccounts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<unknown> {
	const body: IDataObject = {
		socialAccountIds: batchAccountIds(context, itemIndex),
		videoUrl: videoUrl(context, itemIndex),
		post: requiredText(context, 'post', itemIndex, 'Post'),
	};
	const options = context.getNodeParameter('batchPublishingOptions', itemIndex, {}) as IDataObject;
	// Título (só YouTube) vazio não é enviado: a Vizard trata ausente e vazio de forma diferente.
	if (hasOwn(options, 'title') && options.title !== '') body.title = options.title;
	const publishTime = scheduledPublishTime(context, options.publishTime, itemIndex);
	if (publishTime !== undefined) body.publishTime = publishTime;
	return await vizardApiRequest.call(context, 'POST', '/batch-publish-video', {
		body,
		timeout: VIZARD_ROUTE_TIMEOUT_MS,
	});
}

export async function executeSocialOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<unknown> {
	if (operation === 'getSocialAccounts') {
		return await vizardApiRequest.call(this, 'GET', '/social-accounts');
	}

	// As duas operações novas não usam finalVideoId; saem antes da checagem dele, abaixo.
	if (operation === 'publishToMultipleAccounts') {
		return await publishToMultipleAccounts(this, itemIndex);
	}
	if (operation === 'getPublishResult') {
		const customVideoId = requiredText(this, 'customVideoId', itemIndex, 'Custom Video ID');
		return await vizardApiRequest.call(
			this,
			'GET',
			`/publish-result/${encodeURIComponent(customVideoId)}`,
			{ timeout: VIZARD_ROUTE_TIMEOUT_MS },
		);
	}

	// Na v1 o ID é número; na v2 vem do Resource Locator. A leitura única devolve texto,
	// e Number() de texto vazio ou inválido cai na checagem de inteiro positivo abaixo.
	// Só dígitos valem: sem esta regex, "0x1F" e "1e3" passariam pelo Number() e iriam à API
	// como 31 e 1000 (achado F2 do Verifier). Qualquer outra forma vira NaN e cai na checagem abaixo.
	const rawVideoId = getIdParameter(this, 'finalVideoId', itemIndex);
	const finalVideoId = /^\d+$/.test(rawVideoId) ? Number(rawVideoId) : Number.NaN;
	if (!Number.isSafeInteger(finalVideoId) || finalVideoId < 1) {
		throw new NodeOperationError(this.getNode(), 'Final Video ID must be a positive integer', {
			itemIndex,
		});
	}

	if (operation === 'generateCaption') {
		return await vizardApiRequest.call(this, 'POST', '/ai-social', {
			body: {
				finalVideoId,
				aiSocialPlatform: this.getNodeParameter('aiSocialPlatform', itemIndex) as number,
				tone: this.getNodeParameter('tone', itemIndex) as number,
				voice: this.getNodeParameter('voice', itemIndex) as number,
			},
		});
	}

	if (operation === 'publishVideo') {
		// A conta também pode ser texto (v1) ou Resource Locator (v2); vazio é erro nas duas.
		const socialAccountId = getIdParameter(this, 'socialAccountId', itemIndex);
		if (!socialAccountId) {
			throw new NodeOperationError(this.getNode(), 'Social Account ID is required', {
				itemIndex,
			});
		}
		const body: IDataObject = { finalVideoId, socialAccountId };
		const options = this.getNodeParameter('publishingOptions', itemIndex, {}) as IDataObject;
		for (const name of ['post', 'title']) {
			if (hasOwn(options, name)) body[name] = options[name];
		}
		const publishTime = scheduledPublishTime(this, options.publishTime, itemIndex);
		if (publishTime !== undefined) body.publishTime = publishTime;
		return await vizardApiRequest.call(this, 'POST', '/publish-video', { body });
	}

	throw new NodeOperationError(this.getNode(), `Unsupported social operation: ${operation}`, {
		itemIndex,
	});
}
