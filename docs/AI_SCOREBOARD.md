# AI Scoreboard

Use este quadro para registrar revisoes e qualidade por feature.

## Rubrica

| Criterio | 0 | 1 | 2 |
|---|---|---|---|
| Seguranca | Risco alto ou nao revisado | Riscos conhecidos com mitigacao parcial | Riscos revisados e mitigados |
| Testes | Sem cobertura | Cobertura parcial | Unit/API/E2E adequados ao escopo |
| Produto | Fluxo confuso | Funciona com ressalvas | Usuario consegue usar sem friccao |
| Arquitetura | Mistura responsabilidades | Aceitavel, mas com divida clara | Coerente com o projeto |
| Aprendizado | Sem explicacao | Explicacao breve | Modo aprendiz completo |

## Registro

| Data | Branch | Feature | Codex | Claude/ChatGPT | Ollama | Humano | Nota | Status |
|---|---|---|---|---|---|---|---|---|
| 2026-06-08 | `feature/security-tests` | Seguranca das APIs e painel admin | Validado | Revisado | Auditado | Aprovado | 10/10 | Mergeado - CI verde |
| 2026-06-08 | `feature/ai-quality-lab` | Estrutura inicial do AI Quality Lab | Validado | Revisado | Health check verde | Aprovado | 10/10 | Mergeado - CI verde |
| 2026-06-08 | `feature/property-data` | Dados reais, Storage, upload e geocodificacao | Validado | Pendente | Revisado sem achado concreto | Pendente | 9/10 | Aguarda migration e imovel real |

## Como usar

1. Atualize uma linha por feature.
2. Registre quem revisou.
3. Some a nota de 0 a 10.
4. Abra PR somente quando os riscos criticos estiverem tratados.
