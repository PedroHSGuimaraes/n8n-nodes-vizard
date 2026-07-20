import type {
	ICredentialDataDecryptedObject,
	ICredentialTestFunction,
	INodeCredentialTestResult,
} from 'n8n-workflow';

import { VIZARD_API_BASE_URL } from '../transport';

function value(credentials: ICredentialDataDecryptedObject, name: string): string {
	return String(credentials[name] ?? '').trim();
}

function errorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	return 'Vizard rejected the credential test request';
}

export const vizardApiCredentialTest: ICredentialTestFunction = async function (
	credential,
): Promise<INodeCredentialTestResult> {
	const credentials = credential.data ?? {};
	const apiKey = value(credentials, 'apiKey');
	if (!apiKey) return { status: 'Error', message: 'Enter a Vizard API key' };

	try {
		// ICredentialTestFunctions still exposes request() as its only HTTP helper.
		// eslint-disable-next-line @n8n/community-nodes/no-deprecated-workflow-functions
		const response = (await this.helpers.request({
			method: 'GET',
			uri: `${VIZARD_API_BASE_URL}/social-accounts`,
			headers: { Accept: 'application/json', VIZARDAI_API_KEY: apiKey },
			json: true,
		})) as unknown;

		if (response !== null && typeof response === 'object' && !Array.isArray(response)) {
			const code = (response as Record<string, unknown>).code;
			if (code === 4001) return { status: 'Error', message: 'Vizard API key is invalid' };
		}
		return { status: 'OK', message: 'Vizard API credentials are valid' };
	} catch (error) {
		return { status: 'Error', message: errorMessage(error) };
	}
};
