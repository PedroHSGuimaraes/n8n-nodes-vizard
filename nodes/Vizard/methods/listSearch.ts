/*
 * Listas pesquisáveis do editor do n8n (Resource Locator, modo "From List").
 *
 * Duas listas, ambas sustentadas pela documentação da Vizard:
 * - searchVideos: vídeos de um projeto, lidos de videos[] em GET /query/{projectId};
 * - searchSocialAccounts: contas conectadas, lidas de publishAccounts[] em
 *   GET /social-accounts.
 * Nenhuma das duas rotas filtra nem pagina, então a busca por texto é feita aqui.
 */
import type { IDataObject, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

import { VIZARD_LIST_TIMEOUT_MS, vizardApiRequest } from '../transport';

// Tamanho máximo do título no nome do item, para a lista caber na tela.
const MAX_TITLE_LENGTH = 60;

// Mantém só os itens cujo nome contém o texto buscado, sem diferenciar maiúscula.
function filterByText(
	results: INodeListSearchResult['results'],
	filter?: string,
): INodeListSearchResult['results'] {
	const text = filter?.trim().toLowerCase();
	if (!text) return results;
	return results.filter((item) => item.name.toLowerCase().includes(text));
}

// A resposta da Vizard é um objeto; qualquer outra forma vira objeto vazio.
function asObject(response: unknown): IDataObject {
	return response !== null && typeof response === 'object' && !Array.isArray(response)
		? (response as IDataObject)
		: {};
}

// Transforma um item de videos[] em { name, value } com título cortado e duração.
function videoItem(video: IDataObject): { name: string; value: string } {
	const id = String(video.videoId);
	// Sem título, o ID é o único rótulo confiável.
	const title = String(video.title ?? '').trim();
	const label = title ? title.slice(0, MAX_TITLE_LENGTH) : `Video ${id}`;
	// A duração vem em milissegundos; mostramos em segundos inteiros.
	const duration = Number(video.videoMsDuration);
	const suffix = Number.isFinite(duration) ? ` (${Math.round(duration / 1000)} s)` : '';
	return { name: `${label}${suffix}`, value: id };
}

export async function searchVideos(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	// O Project ID é preenchido antes do vídeo; sem ele a lista não tem de onde vir.
	const projectId = String(this.getCurrentNodeParameter('projectId') ?? '').trim();
	if (!projectId) return { results: [] };

	// O código 1000 (em processamento) é resposta normal: a lista fica vazia, sem erro.
	const response = asObject(
		await vizardApiRequest.call(this, 'GET', `/query/${encodeURIComponent(projectId)}`, {
			allowedCodes: [1000, 2000],
			timeout: VIZARD_LIST_TIMEOUT_MS,
		}),
	);
	const videos = Array.isArray(response.videos) ? (response.videos as IDataObject[]) : [];
	return { results: filterByText(videos.map(videoItem), filter) };
}

export async function searchSocialAccounts(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = asObject(
		await vizardApiRequest.call(this, 'GET', '/social-accounts', {
			timeout: VIZARD_LIST_TIMEOUT_MS,
		}),
	);
	const accounts = Array.isArray(response.publishAccounts)
		? (response.publishAccounts as IDataObject[])
		: [];
	const results = accounts.map((account) => {
		const id = String(account.id);
		// Contas de página (ex.: YouTube) podem vir sem username; "page" identifica a conta.
		const who = String(account.username || account.page || id);
		return { name: `${String(account.platform ?? 'Account')} - ${who}`, value: id };
	});
	return { results: filterByText(results, filter) };
}
