/*
 * Testes do lançamento 1.1.0 (versão, CHANGELOG, publish.yml e README).
 *
 * Cada teste vem de um critério da fatia S4 do plan.md em
 * .specs/features/node-cli-campos-v2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

// Raiz do repositório: um nível acima da pasta test.
const raiz = path.join(__dirname, '..');
const ler = (...partes) => fs.readFileSync(path.join(raiz, ...partes), 'utf8');
const pacote = JSON.parse(ler('package.json'));
describe('Lançamento 1.1.0 com estágio no npm', () => {
	it('o package.json está na 1.1.0 e traz o funding do dono', () => {
		assert.equal(pacote.version, '1.1.0');
		assert.deepEqual(pacote.funding, {
			type: 'individual',
			url: 'https://buymeacoffee.com/qTny0AzFXS',
		});
	});

	it('o CHANGELOG tem a seção 1.1.0 com os três assuntos', () => {
		const changelog = ler('CHANGELOG.md');
		const secao = changelog.split('## 1.1.0')[1];
		assert.ok(secao, 'falta a seção ## 1.1.0');
		const corpo = secao.split('## 1.0.0')[0];
		assert.match(corpo, /categor/i);
		assert.match(corpo, /version 2/i);
		assert.match(corpo, /node-cli/i);
	});

	it('o publish.yml publica por stage, com a mesma versão de Node do ci.yml', () => {
		const publicar = ler('.github', 'workflows', 'publish.yml');
		const ci = ler('.github', 'workflows', 'ci.yml');
		assert.match(publicar, /workflow_dispatch:/);
		assert.match(publicar, /npx -y npm@12\.2\.2 stage publish --provenance --access public/);
		assert.match(publicar, /RELEASE_MODE: 'true'/);
		assert.match(publicar, /NODE_AUTH_TOKEN: \$\{\{ secrets\.NPM_TOKEN \}\}/);
		assert.doesNotMatch(publicar, /run: npm run release/);
		// A mesma node-version evita o npm ci quebrar por lock de outro npm.
		const versaoNode = (texto) => texto.match(/node-version: (\d+)/)[1];
		assert.equal(versaoNode(publicar), versaoNode(ci));
	});

	it('o README segue o padrão completo do dono', () => {
		const readme = ler('README.md');
		assert.match(
			readme,
			/\[!\[Apoie no Buy Me a Coffee\]\(.*\)\]\(https:\/\/buymeacoffee\.com\/qTny0AzFXS\)/,
		);
		for (const secao of [
			'Funcionalidades',
			'Instalação',
			'Credenciais',
			'Nós e Operações',
			'Usar como Tool de Agente de IA',
			'Exemplos',
			'Desenvolvimento',
			'Compatibilidade',
			'Recursos',
			'Publicação',
			'Versões',
			'Suporte',
			'Licença',
			'Apoie o projeto',
		]) {
			assert.ok(new RegExp(`^## .*${secao}`, 'm').test(readme), `README sem a seção ${secao}`);
		}
		// A seção de Tool de IA traz a variável que liga a tool, o `$fromAI` com campo real do node
		// e as boas práticas do modelo do RD CRM (achado F1 da revisão).
		assert.match(readme, /N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true/);
		assert.match(readme, /\$fromAI\(/);
		assert.match(readme, /^### Boas práticas/m);
		// O README descreve as duas listas novas da versão 2.
		assert.match(readme, /lista de v[ií]deos/i);
		assert.match(readme, /conta social/i);
	});
});
