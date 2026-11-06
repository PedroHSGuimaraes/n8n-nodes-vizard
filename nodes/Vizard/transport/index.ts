import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

// A mesma chamada serve a execução do node e às listas do editor (listSearch),
// que recebem outro tipo de contexto; os dois têm getNode e a chamada autenticada.
type VizardContext = IExecuteFunctions | ILoadOptionsFunctions;

// Limite de espera das listas do editor: elas rodam enquanto a pessoa digita, então
// 30 s bastam e evitam travar a tela (as submissões de vídeo seguem em 180 s).
export const VIZARD_LIST_TIMEOUT_MS = 30000;

export const VIZARD_API_BASE_URL =
	'https://elb-api.vizard.ai/hvizard-server-front/open-api/v1/project';

const errorDescriptions: Record<number, string> = {
	[-1000]: 'Invalid request parameters.',
	4001: 'Invalid API key.',
	4002: 'Project creation, clipping, or caption generation failed.',
	4003: 'Vizard rate limit exceeded.',
	4004: 'Unsupported video format or unavailable account feature.',
	4005: 'The video is invalid or longer than the editing-mode limit.',
	4006: 'One or more request parameters are illegal.',
	4007: 'The Vizard workspace has insufficient remaining processing minutes.',
	4008: 'Vizard could not download the source video.',
	4009: 'The source video URL is invalid.',
	4010: 'Vizard could not detect the spoken language. Select a specific language.',
	4011: 'The social account ID is invalid.',
};

interface VizardRequestOptions {
	body?: IDataObject;
	allowedCodes?: number[];
	// Espera máxima em milissegundos; sem valor, vale o padrão de 180000 da submissão.
	timeout?: number;
}

function responseCode(response: unknown): number | undefined {
	if (response === null || typeof response !== 'object' || Array.isArray(response))
		return undefined;
	const code = (response as Record<string, unknown>).code;
	return typeof code === 'number' ? code : undefined;
}

function responseErrorMessage(response: unknown, code: number): string {
	if (response !== null && typeof response === 'object' && !Array.isArray(response)) {
		const errMsg = (response as Record<string, unknown>).errMsg;
		if (typeof errMsg === 'string' && errMsg.trim()) return errMsg.trim();
	}
	return errorDescriptions[code] ?? 'Vizard rejected the request.';
}

export function assertVizardResponse(
	context: VizardContext,
	response: unknown,
	allowedCodes: number[] = [2000],
): void {
	const code = responseCode(response);
	if (code === undefined || allowedCodes.includes(code)) return;

	const description = responseErrorMessage(response, code);
	throw new NodeApiError(context.getNode(), {
		message: `Vizard API error ${code}`,
		description,
		code,
	} as JsonObject);
}

export async function vizardApiRequest(
	this: VizardContext,
	method: IHttpRequestMethods,
	endpoint: string,
	request: VizardRequestOptions = {},
): Promise<unknown> {
	const options: IHttpRequestOptions = {
		method,
		baseURL: VIZARD_API_BASE_URL,
		url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
		json: true,
		timeout: request.timeout ?? 180000,
	};
	if (request.body && Object.keys(request.body).length) options.body = request.body;

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'vizardApi',
			options,
		);
		assertVizardResponse(this, response, request.allowedCodes);
		return response;
	} catch (error) {
		if (error instanceof NodeApiError) {
			// Preserve Vizard's application code and the request metadata already attached above.
			// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
			throw error;
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
