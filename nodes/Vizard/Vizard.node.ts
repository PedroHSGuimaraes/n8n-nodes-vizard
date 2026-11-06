import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { executeSocialOperation, executeVideoOperation } from './actions/execute';
import { actionProperties, resourceOptions } from './actions/properties';
import { vizardApiCredentialTest } from './methods/credentialTest';
import { searchSocialAccounts, searchVideos } from './methods/listSearch';

function toDataObject(value: unknown): IDataObject {
	if (value === undefined || value === null || value === '') return { success: true };
	if (typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value)) {
		return value as IDataObject;
	}
	return { data: value as string | number | boolean };
}

export class Vizard implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Vizard',
		name: 'vizard',
		icon: { light: 'file:vizard.svg', dark: 'file:vizard.dark.svg' },
		group: ['transform'],
		// Versão 2 troca finalVideoId e socialAccountId por Resource Locator; a 1 fica como estava
		// para workflows salvos não quebrarem. Node novo nasce na 2.
		version: [1, 2],
		defaultVersion: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Edit short videos, create clips, retrieve outputs, generate social captions, and publish videos with Vizard AI. Use one operation per AI tool. Confirm destination and content before allowing an AI agent to publish externally.',
		defaults: { name: 'Vizard' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'vizardApi',
				required: true,
				testedBy: 'vizardApiCredentialTest',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: resourceOptions,
				default: 'videoProject',
				description: 'Vizard capability to use',
			},
			...actionProperties,
		],
	};

	methods = {
		credentialTest: { vizardApiCredentialTest },
		// Listas do Resource Locator da versão 2 (modo "From List").
		listSearch: { searchVideos, searchSocialAccounts },
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const response =
					resource === 'videoProject'
						? await executeVideoOperation.call(this, operation, itemIndex)
						: await executeSocialOperation.call(this, operation, itemIndex);
				const responseItems = Array.isArray(response) ? response : [response];
				for (const responseItem of responseItems) {
					returnData.push({
						json: toDataObject(responseItem),
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				if (error instanceof NodeApiError || error instanceof NodeOperationError) {
					// Preserve API metadata and item indexes carried by the original n8n error.
					// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}
