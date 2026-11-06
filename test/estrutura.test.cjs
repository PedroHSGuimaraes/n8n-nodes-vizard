/*
 * Testes de estrutura do pacote n8n-nodes-vizard.
 *
 * Estes testes protegem o que não é comportamento do node, mas quebra a
 * publicação ou a verificação do n8n se mudar sem querer: toolchain do
 * node-cli, categoria do node, lock do n8n-workflow, workflows de CI e de
 * publicação, README e CHANGELOG. Cada teste vem de um critério do plan.md
 * em .specs/features/node-cli-campos-v2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

// Raiz do repositório: um nível acima da pasta test.
const raiz = path.join(__dirname, '..');
const ler = (...partes) => fs.readFileSync(path.join(raiz, ...partes), 'utf8');
const pacote = JSON.parse(ler('package.json'));

describe('Toolchain do node-cli 0.55.5', () => {
	it('o build gera o node, a credencial e os ícones em dist', () => {
		// O Vizard.node.js e a credencial são o que o n8n carrega; os dois
		// ícones precisam ficar ao lado do node para o editor mostrá-los.
		for (const arquivo of [
			'dist/nodes/Vizard/Vizard.node.js',
			'dist/credentials/VizardApi.credentials.js',
			'dist/nodes/Vizard/vizard.svg',
			'dist/nodes/Vizard/vizard.dark.svg',
		]) {
			assert.ok(fs.existsSync(path.join(raiz, arquivo)), `falta ${arquivo}`);
		}
	});

	it('o package.json fixa o node-cli, o n8n-workflow e o modo strict', () => {
		assert.equal(pacote.devDependencies['@n8n/node-cli'], '0.55.5');
		assert.equal(pacote.devDependencies['n8n-workflow'], '^2.46.5');
		assert.deepEqual(pacote.peerDependencies, { 'n8n-workflow': '*' });
		assert.equal(pacote.n8n.strict, true);
		// Sem dependências de runtime: a verificação do n8n recusa.
		assert.equal(pacote.dependencies, undefined);
	});

	it('o package-lock resolve o n8n-workflow em 2.46.5 ou mais nova', () => {
		const trava = JSON.parse(ler('package-lock.json'));
		const versao = trava.packages['node_modules/n8n-workflow'].version;
		const [maior, menor, patch] = versao.split('.').map(Number);
		// Comparação numérica por partes, para 2.100.0 não perder de 2.46.5.
		const ok = maior > 2 || (maior === 2 && (menor > 46 || (menor === 46 && patch >= 5)));
		assert.ok(ok, `n8n-workflow resolvido em ${versao}`);
	});

	it('a categoria do node é aceita pelo lint oficial', () => {
		const codex = JSON.parse(ler('nodes', 'Vizard', 'Vizard.node.json'));
		assert.deepEqual(codex.categories, ['Marketing & Content', 'Productivity']);
	});

	it('o workflow de CI roda ci, lint, test e build no Pull Request', () => {
		const ci = ler('.github', 'workflows', 'ci.yml');
		assert.match(ci, /pull_request:/);
		for (const comando of ['npm ci', 'npm run lint', 'npm test', 'npm run build']) {
			assert.ok(ci.includes(`run: ${comando}`), `ci.yml sem o passo run: ${comando}`);
		}
	});
});
