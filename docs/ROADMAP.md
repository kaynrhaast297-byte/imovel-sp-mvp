# Roadmap

Este roadmap consolida o plano de acao atual do ImovelSP.

## Norte

Transformar o MVP tecnico em um MVP com imoveis reais, dados confiaveis e fluxo de administracao seguro.

## Proxima meta

```text
Entregar a primeira lista administrativa de imoveis sem ampliar o escopo.
```

O cadastro de novos imoveis reais esta temporariamente indisponivel. O projeto
avanca pela operabilidade do acervo existente, sem inventar dados.

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
| 7 | Cadastrar 1 imovel real completo | Manual | Preparado - sem inventar CEP/area |
| 8 | Criar detalhe com galeria e mapa | `feature/property-experience` | Pendente |

## Proxima entrega controlada

Branch planejada: `feature/admin-properties-list`.

Escopo:

- rota administrativa server-side protegida;
- listagem paginada dos imoveis existentes;
- busca por titulo, bairro ou cidade;
- filtro por status;
- filtros sincronizados com a URL;
- estados de loading, vazio e erro;
- link para edicao, sem implementar a edicao nesta PR.

Fora de escopo: criacao, exclusao, upload, mudanca de schema e auth nova.

Pre-condicao: issue propria criada somente depois do fechamento da milestone
`Consolidacao v1.0`.

## Regra de priorizacao

Antes de ampliar escopo, responder:

```text
Qual e a menor versao util disso?
```
