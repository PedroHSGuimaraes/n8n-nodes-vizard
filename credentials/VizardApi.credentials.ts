import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class VizardApi implements ICredentialType {
	name = 'vizardApi';

	displayName = 'Vizard API';

	icon = { light: 'file:vizard.svg', dark: 'file:vizard.dark.svg' } as const;

	documentationUrl = 'https://docs.vizard.ai/docs/quickstart';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'API key generated in Vizard under Workspace Settings → API. API access requires a paid Vizard plan.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				VIZARDAI_API_KEY: '={{$credentials.apiKey}}',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
	};
}
