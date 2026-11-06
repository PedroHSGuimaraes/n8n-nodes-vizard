import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

const videoOperations = ['editShortVideo', 'createClips'];

const videoSourceOptions: INodePropertyOptions[] = [
	{ name: 'Remote Video File', value: 1, description: 'Use a directly downloadable video URL' },
	{ name: 'YouTube', value: 2, description: 'Use a standard non-live YouTube video URL' },
	{ name: 'Google Drive', value: 3, description: 'Use a publicly shared Google Drive link' },
	{ name: 'Vimeo', value: 4 },
	{ name: 'StreamYard', value: 5 },
	{ name: 'TikTok', value: 6 },
	{ name: 'Twitter (X)', value: 7 },
	{ name: 'Twitch', value: 9 },
	{ name: 'Loom', value: 10 },
	{ name: 'Facebook', value: 11 },
	{ name: 'LinkedIn', value: 12 },
	// Tipos 13 e 14: a referência "submit" e o guia "docs/basic" da Vizard concordam.
	{ name: 'Dropbox', value: 13 },
	{ name: 'Instagram', value: 14 },
];

const languageOptions: INodePropertyOptions[] = [
	{ name: 'Auto Detect', value: 'auto' },
	{ name: 'Arabic', value: 'ar' },
	{ name: 'Bulgarian', value: 'bg' },
	{ name: 'Cantonese', value: 'yue' },
	{ name: 'Croatian', value: 'hr' },
	{ name: 'Czech', value: 'cs' },
	{ name: 'Danish', value: 'da' },
	{ name: 'Dutch', value: 'nl' },
	{ name: 'English', value: 'en' },
	{ name: 'Finnish', value: 'fi' },
	{ name: 'French', value: 'fr' },
	{ name: 'German', value: 'de' },
	{ name: 'Greek', value: 'el' },
	{ name: 'Hebrew', value: 'iw' },
	{ name: 'Hindi', value: 'hi' },
	{ name: 'Hungarian', value: 'hu' },
	{ name: 'Indonesian', value: 'id' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Japanese', value: 'ja' },
	{ name: 'Korean', value: 'ko' },
	{ name: 'Lithuanian', value: 'lt' },
	{ name: 'Malay', value: 'mal' },
	{ name: 'Mandarin - Simplified', value: 'zh' },
	{ name: 'Mandarin - Traditional', value: 'zh-TW' },
	{ name: 'Norwegian', value: 'no' },
	{ name: 'Polish', value: 'pl' },
	{ name: 'Portuguese', value: 'pt' },
	{ name: 'Romanian', value: 'ro' },
	{ name: 'Russian', value: 'ru' },
	{ name: 'Serbian', value: 'sr' },
	{ name: 'Slovak', value: 'sk' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'Swedish', value: 'sv' },
	{ name: 'Tamil', value: 'ta' },
	{ name: 'Turkish', value: 'tr' },
	{ name: 'Ukrainian', value: 'uk' },
	{ name: 'Vietnamese', value: 'vi' },
];

const commonEditingFields: INodeProperties[] = [
	{
		displayName: 'Aspect Ratio',
		name: 'ratioOfClip',
		type: 'options',
		options: [
			{ name: '9:16 - Vertical', value: 1 },
			{ name: '1:1 - Square', value: 2 },
			{ name: '4:5 - Portrait', value: 3 },
			{ name: '16:9 - Horizontal', value: 4 },
		],
		default: 1,
		description: 'Aspect ratio of generated output videos',
	},
	{
		displayName: 'Auto B-Roll',
		name: 'autoBrollSwitch',
		type: 'boolean',
		default: false,
		description: 'Whether to add AI-selected B-roll automatically',
	},
	{
		displayName: 'Auto Emojis',
		name: 'emojiSwitch',
		type: 'boolean',
		default: false,
		description: 'Whether to add emojis to subtitles automatically',
	},
	{
		displayName: 'Highlight Keywords',
		name: 'highlightSwitch',
		type: 'boolean',
		default: false,
		description: 'Whether to highlight important words in subtitles automatically',
	},
	{
		displayName: 'Project Name',
		name: 'projectName',
		type: 'string',
		default: '',
		description: 'Custom name for the Vizard project',
	},
	{
		displayName: 'Remove Silence and Filler Words',
		name: 'removeSilenceSwitch',
		type: 'boolean',
		default: false,
		description: 'Whether to remove silent gaps and filler words from generated videos',
	},
	{
		displayName: 'Show Headline',
		name: 'headlineSwitch',
		type: 'boolean',
		default: true,
		description: 'Whether to add an AI-generated headline during the opening seconds',
	},
	{
		displayName: 'Show Subtitles',
		name: 'subtitleSwitch',
		type: 'boolean',
		default: true,
		description: 'Whether to show subtitles in generated videos',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description:
			'ID of a personal or Brand Kit template whose ratio matches the selected output ratio',
	},
];

const createClipFields: INodeProperties[] = [
	...commonEditingFields,
	{
		displayName: 'Keywords or Prompt',
		name: 'keywords',
		type: 'string',
		default: '',
		description: 'Instruction describing topics or moments that generated clips should contain',
	},
	{
		displayName: 'Maximum Number of Clips',
		name: 'maxClipNumber',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 10,
		description: 'Maximum number of clips to generate, from 1 to 100',
	},
	{
		displayName: 'Clip Model',
		name: 'clipModel',
		type: 'options',
		options: [
			{ name: 'Model V1', value: 'clip_v1', description: 'Standard processing and billing' },
			{
				name: 'Model V2',
				value: 'clip_v2',
				description: 'Newer clip model, billed at 1.25 times the Model v1 rate',
			},
		],
		default: 'clip_v1',
		description:
			'AI model that analyzes the video and generates clips. Model v2 is charged at 1.25 times the Model v1 rate.',
	},
];

export const resourceOptions: INodePropertyOptions[] = [
	{
		name: 'Video Project',
		value: 'videoProject',
		description: 'Edit short videos, create clips, or retrieve generated output',
	},
	{
		name: 'Social Publishing',
		value: 'socialPublishing',
		description: 'Generate captions, list connected accounts, or publish generated videos',
	},
];

export const actionProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['videoProject'] } },
		options: [
			{
				name: 'Edit Short Video',
				value: 'editShortVideo',
				action: 'Edit a short video',
				description:
					'Add subtitles, B-roll, emojis, highlights, a headline, branding, or silence removal to a video shorter than three minutes',
			},
			{
				name: 'Create Clips From Long Video',
				value: 'createClips',
				action: 'Create clips from a long video',
				description: 'Analyze a long video and generate social-ready short clips',
			},
			{
				name: 'Get Project Output',
				value: 'getProject',
				action: 'Get project output',
				description: 'Retrieve processing status and generated output videos for a project',
			},
			{
				name: 'Delete Project',
				value: 'deleteProject',
				action: 'Delete a project',
				description:
					'Warning: permanently deletes a Vizard project and its generated videos. Requires the Confirm Delete switch.',
			},
		],
		default: 'editShortVideo',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['socialPublishing'] } },
		options: [
			{
				name: 'Generate AI Caption',
				value: 'generateCaption',
				action: 'Generate an AI social caption',
				description: 'Generate platform-specific social copy for a video containing speech',
			},
			{
				name: 'Get Connected Accounts',
				value: 'getSocialAccounts',
				action: 'Get connected social accounts',
				description: 'List social accounts connected to the Vizard workspace',
			},
			{
				name: 'Get Publish Result',
				value: 'getPublishResult',
				action: 'Get a publish result',
				description: 'Retrieve the publishing result of a multi-account publish',
			},
			{
				name: 'Publish To Multiple Accounts',
				value: 'publishToMultipleAccounts',
				action: 'Publish a video to multiple accounts',
				description:
					'Publish one video file to every selected account, now or on a schedule. Confirm the accounts before running.',
			},
			{
				name: 'Publish Video',
				value: 'publishVideo',
				action: 'Publish a generated video',
				description: 'Publish now or schedule publication to a connected social account',
			},
		],
		default: 'getSocialAccounts',
	},
	{
		displayName: 'Video URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/video.mp4',
		displayOptions: { show: { resource: ['videoProject'], operation: videoOperations } },
		description: 'Public URL of the source video',
	},
	{
		displayName: 'Video Source',
		name: 'videoType',
		type: 'options',
		options: videoSourceOptions,
		default: 1,
		required: true,
		displayOptions: { show: { resource: ['videoProject'], operation: videoOperations } },
		description: 'Platform or storage type matching the supplied video URL',
	},
	{
		displayName: 'File Extension',
		name: 'ext',
		type: 'options',
		options: [
			{ name: 'MP4', value: 'mp4' },
			{ name: '3GP', value: '3gp' },
			{ name: 'AVI', value: 'avi' },
			{ name: 'MOV', value: 'mov' },
		],
		default: 'mp4',
		required: true,
		displayOptions: {
			show: { resource: ['videoProject'], operation: videoOperations, videoType: [1] },
		},
		description: 'Extension of the directly downloadable video file',
	},
	{
		displayName: 'Spoken Language',
		name: 'lang',
		type: 'options',
		options: languageOptions,
		default: 'auto',
		required: true,
		displayOptions: { show: { resource: ['videoProject'], operation: videoOperations } },
		description: 'Language spoken in the video, or automatic detection',
	},
	{
		displayName: 'Preferred Clip Lengths',
		name: 'preferLength',
		type: 'multiOptions',
		options: [
			{ name: 'Auto', value: 0 },
			{ name: 'Under 30 Seconds', value: 1 },
			{ name: '30 to 60 Seconds', value: 2 },
			{ name: '60 to 90 Seconds', value: 3 },
			{ name: '90 Seconds to 3 Minutes', value: 4 },
		],
		default: [0],
		required: true,
		displayOptions: { show: { resource: ['videoProject'], operation: ['createClips'] } },
		description: 'One or more target clip duration ranges; Auto cannot be combined with others',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['videoProject'], operation: ['editShortVideo'] } },
		options: commonEditingFields,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['videoProject'], operation: ['createClips'] } },
		options: createClipFields,
	},
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['videoProject'], operation: ['getProject', 'deleteProject'] },
		},
		description: 'Project ID returned when a video submission is accepted',
	},
	// --- Versão 2: o vídeo vem de uma lista do projeto informado em Project ID ---
	{
		// Rótulo do campo que a lista de vídeos lê (searchVideos usa este "projectId").
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		// Obrigatório: sem o projeto a lista de vídeos não tem de onde vir.
		required: true,
		displayOptions: {
			show: {
				// Só aparece nas operações sociais que escolhem um vídeo...
				resource: ['socialPublishing'],
				operation: ['generateCaption', 'publishVideo'],
				// ...e só em node novo (versão 2 em diante).
				'@version': [{ _cnd: { gte: 2 } }],
			},
		},
		description: 'Project that holds the video; use the ID returned when the video was submitted',
	},
	{
		// Mesmo "name" da versão 1 (finalVideoId): só o tipo muda, para o execute ler igual.
		displayName: 'Final Video',
		name: 'finalVideoId',
		type: 'resourceLocator',
		// Começa em "From List", o modo guiado que a UX guideline do n8n pede como padrão.
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['socialPublishing'],
				operation: ['generateCaption', 'publishVideo'],
				'@version': [{ _cnd: { gte: 2 } }],
			},
		},
		modes: [
			{
				// Modo lista: chama searchVideos, que lê videos[] do projeto.
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a video...',
				typeOptions: { searchListMethod: 'searchVideos', searchable: true },
			},
			{
				// Modo ID: para colar o videoId vindo de Get Project Output ou de uma expressão.
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 14015572',
				// O videoId da Vizard é inteiro positivo; recusa texto antes de chamar a API.
				validation: [
					{
						type: 'regex',
						properties: { regex: '^[0-9]+$', errorMessage: 'Not a valid video ID' },
					},
				],
			},
		],
		description:
			'Video generated by Vizard; pick it from the project videos or paste its ID from Get Project Output',
	},
	// --- Versão 1: mesmo nome e tipo da 1.0.0 (número digitado), para workflows salvos ---
	{
		displayName: 'Final Video ID',
		name: 'finalVideoId',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['socialPublishing'],
				operation: ['generateCaption', 'publishVideo'],
				// Só na versão 1: workflows salvos continuam vendo o número.
				'@version': [1],
			},
		},
		description: 'Video ID returned inside the videos array by Get Project Output',
	},
	{
		displayName: 'Platform Style',
		name: 'aiSocialPlatform',
		type: 'options',
		options: [
			{ name: 'General', value: 1 },
			{ name: 'TikTok', value: 2 },
			{ name: 'Instagram', value: 3 },
			{ name: 'YouTube', value: 4 },
			{ name: 'Facebook', value: 5 },
			{ name: 'LinkedIn', value: 6 },
			{ name: 'Twitter (X)', value: 7 },
		],
		default: 1,
		displayOptions: { show: { resource: ['socialPublishing'], operation: ['generateCaption'] } },
		description: 'Social platform whose writing style the generated caption should follow',
	},
	{
		displayName: 'Tone',
		name: 'tone',
		type: 'options',
		options: [
			{ name: 'Neutral', value: 0 },
			{ name: 'Interesting', value: 1 },
			{ name: 'Catchy', value: 2 },
			{ name: 'Serious', value: 3 },
			{ name: 'Question', value: 4 },
		],
		default: 0,
		displayOptions: { show: { resource: ['socialPublishing'], operation: ['generateCaption'] } },
		description: 'Tone used for the generated caption',
	},
	{
		displayName: 'Voice',
		name: 'voice',
		type: 'options',
		options: [
			{ name: 'First Person', value: 0 },
			{ name: 'Third Person', value: 1 },
		],
		default: 0,
		displayOptions: { show: { resource: ['socialPublishing'], operation: ['generateCaption'] } },
		description: 'Narrative perspective used for the generated caption',
	},
	// --- Versão 2: a conta vem da lista de contas conectadas ao workspace ---
	{
		// Mesmo "name" da versão 1 (socialAccountId): só o tipo muda.
		displayName: 'Social Account',
		name: 'socialAccountId',
		type: 'resourceLocator',
		// "From List" como padrão, como pede a UX guideline do n8n.
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				// Só aparece ao publicar, e só em node novo (versão 2 em diante).
				resource: ['socialPublishing'],
				operation: ['publishVideo'],
				'@version': [{ _cnd: { gte: 2 } }],
			},
		},
		modes: [
			{
				// Modo lista: chama searchSocialAccounts, que lê publishAccounts[].
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select an account...',
				typeOptions: { searchListMethod: 'searchSocialAccounts', searchable: true },
			},
			{
				// Modo ID: para colar o ID de Get Connected Accounts ou de uma expressão.
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. 123456',
			},
		],
		description: 'Connected social account that will publish the video',
	},
	// --- Versão 1: texto digitado, como na 1.0.0 ---
	{
		displayName: 'Social Account ID',
		name: 'socialAccountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			// Só na versão 1: workflows salvos continuam vendo o texto.
			show: { resource: ['socialPublishing'], operation: ['publishVideo'], '@version': [1] },
		},
		description: 'Connected account ID returned by Get Connected Accounts',
	},
	{
		displayName: 'Publishing Options',
		name: 'publishingOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['socialPublishing'], operation: ['publishVideo'] } },
		options: [
			{
				displayName: 'Post',
				name: 'post',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'Post description; leave empty to let Vizard generate it',
			},
			{
				displayName: 'Publish Time',
				name: 'publishTime',
				type: 'dateTime',
				default: '',
				description: 'Future time to publish; omit to publish immediately',
			},
			{
				displayName: 'YouTube Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'YouTube-only title; leave empty to let Vizard generate it',
			},
		],
	},
	// --- Delete Project: a confirmação é obrigatória e começa desligada ---
	{
		displayName: 'Confirm Delete',
		name: 'confirmDelete',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['videoProject'], operation: ['deleteProject'] } },
		description:
			'Whether to confirm that the project and its generated videos are permanently deleted. Without it the operation stops before calling the API.',
	},
	// --- Publish To Multiple Accounts ---
	{
		displayName: 'Social Accounts',
		name: 'socialAccounts',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Account',
		default: {},
		required: true,
		displayOptions: {
			show: { resource: ['socialPublishing'], operation: ['publishToMultipleAccounts'] },
		},
		options: [
			{
				displayName: 'Accounts',
				name: 'accounts',
				values: [
					{
						displayName: 'Account',
						name: 'accountId',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select an account...',
								typeOptions: { searchListMethod: 'searchSocialAccounts', searchable: true },
							},
							{
								displayName: 'By ID',
								name: 'id',
								type: 'string',
								placeholder: 'e.g. 123456',
							},
						],
						description: 'Connected social account that will publish the video',
					},
				],
			},
		],
		description: 'Connected accounts that receive the video; each account is added once',
	},
	{
		displayName: 'Video URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/video.mp4',
		displayOptions: {
			show: { resource: ['socialPublishing'], operation: ['publishToMultipleAccounts'] },
		},
		description: 'Public URL of a video file that Vizard can download directly',
	},
	{
		displayName: 'Post',
		name: 'post',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['socialPublishing'], operation: ['publishToMultipleAccounts'] },
		},
		description: 'Video description used in the social post',
	},
	{
		displayName: 'Publishing Options',
		name: 'batchPublishingOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['socialPublishing'], operation: ['publishToMultipleAccounts'] },
		},
		options: [
			{
				displayName: 'Publish Time',
				name: 'publishTime',
				type: 'dateTime',
				default: '',
				description: 'Future time to publish; omit to publish immediately',
			},
			{
				displayName: 'YouTube Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title used only for YouTube accounts',
			},
		],
	},
	// --- Get Publish Result ---
	{
		displayName: 'Custom Video ID',
		name: 'customVideoId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['socialPublishing'], operation: ['getPublishResult'] } },
		description: 'Video file ID generated from the Video URL of a multi-account publish',
	},
];
