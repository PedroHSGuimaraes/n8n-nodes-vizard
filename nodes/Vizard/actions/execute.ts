import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { getIdParameter } from '../helpers/resourceLocator';
import { vizardApiRequest } from '../transport';

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
	for (const name of ['keywords', 'maxClipNumber', 'projectName', 'ratioOfClip', 'templateId']) {
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

export async function executeSocialOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<unknown> {
	if (operation === 'getSocialAccounts') {
		return await vizardApiRequest.call(this, 'GET', '/social-accounts');
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
