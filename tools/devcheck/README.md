# ⚡ DevCheck

> Portão local obrigatório de qualidade e segurança antes do push.

---

## Filosofia

| Ponto | Decisão |
|-------|---------|
| Docker | **Opcional** — ausência = `SKIPPED`, nunca `FAIL` |
| CI/CD | GitHub Actions continua sendo a validação **oficial** |
| DevCheck | Gate **local e bloqueante** antes de cada push |

---

## Fluxo

```
Implementar → validar candidato → commit local → devcheck approve → Push → GitHub Actions
```

---

## Instalação (Windows)

```powershell
# 1. Copie a pasta devcheck/ para C:\ferramentas\devcheck\
# 2. Execute:
.\install.ps1

# 3. Adicione manualmente ao $PROFILE se preferir:
function devcheck { python C:\ferramentas\devcheck\devcheck\cli\main.py @args }
```

---

## Comandos

```powershell
devcheck health                      # diagnóstico do projeto
devcheck quick                       # Git + Lint + Unit Tests
devcheck full                        # Suite completa (7 camadas)
devcheck approve                     # Full + decisão de commit
devcheck security                    # Apenas security scan
devcheck ai-report                   # Relatório para colar no Claude/Codex
devcheck dashboard                   # http://localhost:5555
devcheck dashboard --port 8080       # porta customizada

# Rodar em outro diretório (sem precisar de cd):
devcheck approve D:\ESTUDOS\PROJETOS\imovel-sp-mvp
devcheck full C:\projetos\meu-projeto
```

---

## devcheck.json

Crie na raiz do projeto para customizar:

```json
{
  "test_cmd": ["python", "-m", "pytest", "-v"],
  "integration_cmd": ["python", "-m", "pytest", "tests/integration"],
  "e2e_cmd": ["python", "-m", "pytest", "tests/e2e"],
  "coverage_cmd": ["python", "-m", "pytest", "--cov=."],
  "security_cmd": ["python", "-m", "pip_audit"],
  "coverage_threshold": 80,

  "git_check":         { "blocking": true, "require_clean": true },
  "quality_gates":     { "blocking": true  },
  "unit_tests":        { "blocking": true  },
  "integration_tests": { "blocking": true  },
  "e2e_tests":         { "blocking": true  },
  "coverage":          { "blocking": true  },
  "security_scan":     { "blocking": true  }
}
```

### Campos disponíveis

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `test_cmd` | `list` | Comando para rodar testes unitários |
| `integration_cmd` | `list` | Comando para testes de integração |
| `e2e_cmd` | `list` | Comando para testes E2E |
| `coverage_cmd` | `list` | Comando bloqueante de cobertura |
| `security_cmd` | `list` | Comando bloqueante de segurança |
| `coverage_threshold` | `int` | % mínimo de cobertura (default: 80) |
| `<etapa>.blocking` | `bool` | Se FAIL nessa etapa reprova o `approve` |

---

## Estados possíveis

| Estado | Ícone | Significado |
|--------|-------|-------------|
| `PASS` | ✅ | Passou |
| `FAIL` | ❌ | Falhou — bloqueia se `blocking: true` |
| `WARN` | ⚠️ | Alerta; reprova o `approve` |
| `SKIPPED` | ⏭️ | Não rodou; reprova o `approve` |
| `ERROR` | 💥 | Erro interno do DevCheck |

---

## Logs

```
.devcheck/logs/
├── ultima-execucao.txt          ← sempre atualizado
├── 20240610_143022_full.txt
├── 20240610_142000_quick.txt
└── 20240610_141500_approve.txt
```

---

## Camadas de validação

| # | Camada | Quick | Full | Approve |
|---|--------|-------|------|---------|
| 1 | Git Check | ✓ | ✓ | ✓ |
| 2 | Quality Gates | ✓ | ✓ | ✓ |
| 3 | Unit Tests | ✓ | ✓ | ✓ |
| 4 | Integration Tests | — | ✓ | ✓ |
| 5 | E2E Tests | — | ✓ | ✓ |
| 6 | Coverage | — | ✓ | ✓ |
| 7 | Security Scan | — | ✓ | ✓ |

---

## Projetos suportados

`Next.js` · `React` · `Node.js` · `Python` · `Go` · `Rust` · `Java` · `Genérico`

---

## Docker (Fase 2)

Docker é 100% opcional. Sem Docker:
- Nenhum comando falha
- Todos os checks de container aparecem como `SKIPPED`
- O `approve` não reprova por ausência de Docker

---

## DevCheck e CI/CD

O DevCheck bloqueia localmente antes do push. O GitHub Actions confirma a mesma qualidade em ambiente remoto. Os dois precisam passar.
