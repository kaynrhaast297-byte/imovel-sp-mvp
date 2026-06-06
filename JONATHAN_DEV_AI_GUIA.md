# Jonathan Dev AI - Guia de Execucao

Este guia transforma o plano do celular em uma sequencia pratica para rodar no PC dentro do projeto `imovel-sp-mvp`.

## Estado atual

- Vitest configurado.
- React Testing Library configurado.
- Rota `/api/ai` criada para conversar com Ollama.
- Pagina `/ai` criada e integrada ao layout.
- GitHub Actions criado em `.github/workflows/ci.yml`.
- APIs principais de imoveis e leads cobertas por testes.

## Fase 1 - Testes com Vitest

Dependencias ja instaladas:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

Comandos principais:

```bash
npm test
npm run test:watch
npm run test:coverage
npm run check
```

Use `npm run check` antes de commit. Ele roda TypeScript, ESLint e testes.

## Fase 2 - Ollama local

Modelo recomendado para programacao nesta maquina:

```bash
ollama pull qwen2.5-coder:7b
ollama run qwen2.5-coder:7b "Explique o que e uma funcao pura em JavaScript"
ollama serve
```

Variaveis esperadas:

```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
```

## Fase 3 - Next.js com IA local

Arquivos criados:

- `app/api/ai/route.ts`
- `app/ai/page.tsx`

Para testar no navegador:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000/ai
```

Para testar a API manualmente:

```bash
curl http://localhost:3000/api/ai
curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d "{\"prompt\":\"Explique Next.js em uma linha.\"}"
```

## Fase 4 - CI com GitHub Actions

Arquivo criado:

```text
.github/workflows/ci.yml
```

O CI roda em push e pull request para `main` e `develop`:

```bash
npm run test:coverage
npm run lint
npm run type-check
npm run build
```

## Proximas evolucoes

1. Testar componentes: `LeadForm`, `PriceAnalysis`, `ImovelCard`.
2. Adicionar Playwright para fluxos reais no navegador.
3. Criar comandos para a IA sugerir testes a partir dos arquivos do projeto.
4. Adicionar thresholds de cobertura quando a base estiver estavel:

```ts
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
  },
}
```
