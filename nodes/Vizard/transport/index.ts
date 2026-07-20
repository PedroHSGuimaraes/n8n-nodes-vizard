import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

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
	context: IExecuteFunctions,
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
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	request: VizardRequestOptions = {},
): Promise<unknown> {
	const options: IHttpRequestOptions = {
		method,
		baseURL: VIZARD_API_BASE_URL,
		url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
		json: true,
		timeout: 180000,
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
