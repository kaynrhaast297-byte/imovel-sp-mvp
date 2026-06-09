# Roadmap

Este roadmap consolida o plano de acao atual do ImovelSP.

## Norte

Transformar o MVP tecnico em um MVP com imoveis reais, dados confiaveis e fluxo de administracao seguro.

## Proxima meta

```text
Cadastrar 1 imovel real perfeitamente.
```

## Fases

| Fase | Objetivo | Resultado esperado |
|---|---|---|
| Seguranca | Fechar auth admin, RLS, validacao e erros seguros | Escrita e upload podem evoluir com menos risco |
| AI Quality Lab | Padronizar docs, scripts, relatorios e revisoes | Toda feature passa por processo repetivel |
| Property Data | Criar dados reais, fotos, CEP e geocodificacao | Primeiro imovel real completo |
| Property Experience | Galeria, mapa, CTA, favoritos e busca melhor | Experiencia publica mais util |
| Escala | CSV, dashboard, auth multiusuario e metricas | Operacao pronta para crescer |

## Entregas atuais

| Ordem | Entrega | Branch | Status |
|---|---|---|---|
| 1 | Finalizar e revisar seguranca | `feature/security-tests` | Concluido - CI verde |
| 2 | Criar AI Quality Lab | `feature/ai-quality-lab` | Concluido |
| 3 | Criar bucket `property-images` | `feature/property-data` | Implementado localmente |
| 4 | Expandir schema real dos imoveis | `feature/property-data` | Implementado localmente |
| 5 | Admin com upload multiplo e preview | `feature/property-data` | Implementado |
| 6 | Geocodificacao ViaCEP + Nominatim | `feature/property-data` | Implementado |
| 7 | Cadastrar 1 imovel real completo | Manual | Pendente |
| 8 | Criar detalhe com galeria e mapa | `feature/property-experience` | Pendente |

## Regra de priorizacao

Antes de ampliar escopo, responder:

```text
Qual e a menor versao util disso?
```
