/*
 * Leitura única do ID de campos que podem ser texto/número (versão 1 do node)
 * ou Resource Locator (versão 2).
 *
 * Por que existe: na versão 2 o parâmetro vira { mode, value }, mas a versão 1
 * continua guardando o valor direto. Com este único ponto de leitura, o
 * restante do código não precisa saber qual versão está rodando.
 */
import type { IExecuteFunctions } from 'n8n-workflow';

/**
 * Devolve o ID do parâmetro como texto sem espaços nas pontas.
 * Aceita três formas: objeto { mode, value } (v2), texto ou número (v1, ou
 * expressão já resolvida por um AI Agent). Valor ausente vira texto vazio.
 */
export function getIdParameter(
	context: IExecuteFunctions,
	name: string,
	itemIndex: number,
): string {
	// O terceiro argumento evita erro quando o parâmetro não existe no item.
	const raw = context.getNodeParameter(name, itemIndex, '') as unknown;
	// Resource Locator guarda o ID em "value"; os demais formatos já são o ID.
	const value = raw !== null && typeof raw === 'object' && 'value' in raw ? raw.value : raw;
	return String(value ?? '').trim();
}
