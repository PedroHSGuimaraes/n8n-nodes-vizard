const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { VizardApi } = require('../dist/credentials/VizardApi.credentials');
const {
	executeSocialOperation,
	executeVideoOperation,
} = require('../dist/nodes/Vizard/actions/execute');
const { actionProperties } = require('../dist/nodes/Vizard/actions/properties');
const { Vizard } = require('../dist/nodes/Vizard/Vizard.node');

function executionContext(parameters, responder) {
	return {
		getNode: () => ({ name: 'Vizard', type: 'vizard', typeVersion: 1 }),
		getNodeParameter: (name, _itemIndex, defaultValue) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : defaultValue,
		helpers: {
			httpRequestWithAuthentication: async (_credentialType, options) => responder(options),
		},
	};
}

describe('Vizard video operations', () => {
	it('submits short-video editing with fixed editing mode and guided settings', async () => {
		let request;
		const context = executionContext(
			{
				videoUrl: 'https://cdn.example.com/source.mp4',
				videoType: 1,
				ext: 'mp4',
				lang: 'pt',
				additionalFields: {
					ratioOfClip: 1,
					subtitleSwitch: true,
					emojiSwitch: false,
					autoBrollSwitch: true,
					projectName: 'Campanha julho',
				},
			},
			(options) => {
				request = options;
				return { code: 2000, projectId: 17861706 };
			},
		);

		assert.deepEqual(await executeVideoOperation.call(context, 'editShortVideo', 0), {
			code: 2000,
			projectId: 17861706,
		});
		assert.equal(request.method, 'POST');
		assert.equal(request.url, '/create');
		assert.deepEqual(request.body, {
			lang: 'pt',
			videoType: 1,
			videoUrl: 'https://cdn.example.com/source.mp4',
			ext: 'mp4',
			getClips: 0,
			projectName: 'Campanha julho',
			ratioOfClip: 1,
			autoBrollSwitch: 1,
			emojiSwitch: 0,
			subtitleSwitch: 1,
		});
	});

	it('does not send a file extension for platform-hosted videos', async () => {
		let request;
		const context = executionContext(
			{
				videoUrl: 'https://www.youtube.com/watch?v=example',
				videoType: 2,
				lang: 'auto',
				preferLength: [1, 2],
				additionalFields: {},
			},
			(options) => {
				request = options;
				return { code: 2000, projectId: 42 };
			},
		);

		await executeVideoOperation.call(context, 'createClips', 0);
		assert.deepEqual(request.body.preferLength, [1, 2]);
		assert.equal('ext' in request.body, false);
		assert.equal('getClips' in request.body, false);
	});

	it('rejects Auto clip length combined with explicit ranges before a request', async () => {
		let requestCalled = false;
		const context = executionContext(
			{
				videoUrl: 'https://www.youtube.com/watch?v=example',
				videoType: 2,
				lang: 'en',
				preferLength: [0, 2],
			},
			() => {
				requestCalled = true;
			},
		);

		await assert.rejects(
			executeVideoOperation.call(context, 'createClips', 0),
			/Auto clip length cannot be combined/,
		);
		assert.equal(requestCalled, false);
	});

	it('allows the documented still-processing response when retrieving a project', async () => {
		const context = executionContext({ projectId: '17861706' }, () => ({
			code: 1000,
			videos: [],
		}));

		assert.deepEqual(await executeVideoOperation.call(context, 'getProject', 0), {
			code: 1000,
			videos: [],
		});
	});

	it('turns Vizard application-level failures into node errors', async () => {
		const context = executionContext(
			{
				videoUrl: 'https://cdn.example.com/too-long.mp4',
				videoType: 1,
				ext: 'mp4',
				lang: 'auto',
			},
			() => ({ code: 4005, errMsg: 'Video is longer than three minutes' }),
		);

		await assert.rejects(executeVideoOperation.call(context, 'editShortVideo', 0));
	});
});

describe('Vizard social operations', () => {
	it('converts scheduled publishing dates to Unix milliseconds', async () => {
		let request;
		const context = executionContext(
			{
				finalVideoId: 14015572,
				socialAccountId: 'account-123',
				publishingOptions: {
					publishTime: '2026-07-21T15:30:00.000Z',
					post: 'Novo vídeo',
				},
			},
			(options) => {
				request = options;
				return { code: 2000 };
			},
		);

		await executeSocialOperation.call(context, 'publishVideo', 0);
		assert.equal(request.url, '/publish-video');
		assert.equal(request.body.publishTime, 1784647800000);
		assert.equal(request.body.socialAccountId, 'account-123');
	});
});

describe('Vizard node definition', () => {
	it('defaults to short-video editing and can be used as an AI tool', () => {
		const description = new Vizard().description;
		const videoOperation = actionProperties.find(
			(property) =>
				property.name === 'operation' &&
				property.displayOptions?.show?.resource?.includes('videoProject'),
		);

		assert.equal(description.usableAsTool, true);
		assert.equal(description.properties[0].default, 'videoProject');
		assert.equal(videoOperation.default, 'editShortVideo');
	});

	it('keeps the API key in a password credential and the required Vizard header', () => {
		const credential = new VizardApi();
		const apiKey = credential.properties.find(({ name }) => name === 'apiKey');

		assert.equal(apiKey.typeOptions.password, true);
		assert.equal(
			credential.authenticate.properties.headers.VIZARDAI_API_KEY,
			'={{$credentials.apiKey}}',
		);
	});
});
