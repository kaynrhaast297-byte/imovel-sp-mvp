# Feature Plan

## Objetivo da proxima fase

Transformar o ImovelSP de MVP tecnico em MVP com imoveis reais.

Meta imediata:

```text
Cadastrar 1 imovel real perfeitamente.
```

Um imovel real completo vale mais do que centenas de imoveis incompletos. Esse primeiro cadastro vira o modelo padrao para replicar depois.

## Branches planejadas

| Ordem | Escopo | Branch | Condicao |
|---|---|---|---|
| 0 | Fechar seguranca atual | `feature/security-tests` | Concluido com CI verde |
| 1 | AI Quality Lab | `feature/ai-quality-lab` | Em finalizacao |
| 2 | Dados reais e fotos | `feature/property-data` | So depois do merge do AI Quality Lab |
| 3 | Experiencia do imovel | `feature/property-experience` | So depois de `property-data` verde |

## `feature/property-data`

Campos a adicionar ou confirmar:

```text
endereco, numero, cep, complemento
bairro, cidade, estado
latitude, longitude, localizacao_aproximada
fotos, area
quartos, banheiros, vagas
condominio, iptu
origem, url_origem
```

Prioridade:

```text
endereco, cep, fotos, latitude, longitude
```

## Roadmap operacional

| # | Etapa | Branch | Status |
|---|---|---|---|
| 0 | Merge seguranca | `feature/security-tests -> master` | Concluido - CI verde |
| 1 | Finalizar AI Quality Lab | `feature/ai-quality-lab -> master` | Em andamento |
| 2 | Supabase Storage com bucket `property-images` | `feature/property-data` | Proxima |
| 3 | Schema real dos imoveis | `feature/property-data` | Pendente |
| 4 | Admin completo com fotos, CEP, endereco e numero | `feature/property-data` | Pendente |
| 5 | Upload multiplo com preview e foto principal | `feature/property-data` | Pendente |
| 6 | Geocodificacao com ViaCEP + Nominatim | `feature/property-data` | Pendente |
| 7 | Validacao Zod de CEP, preco, fotos, endereco e tipo | `feature/property-data` | Pendente |
| 8 | Cadastrar 1 imovel real completo | Manual | Pendente |
| 9 | Fallback profissional para imoveis sem foto | `feature/property-data` | Pendente |
| 10 | Testes + Ollama + PR | `feature/property-data` | Pendente |
| 11 | Pagina de detalhe com galeria, mapa e CTA | `feature/property-experience` | Apos dados reais |
| 12 | Swiper, Leaflet e favoritos | `feature/property-experience` | Pendente |
| 13 | Busca avancada | `feature/property-experience` | Pendente |
| 14 | Importacao por CSV | Branch propria | Futuro |
| 15 | Dashboard admin e metricas | Branch propria | Futuro |
| 16 | Supabase Auth multiusuario | Branch propria | Futuro |

## Definition of done

Uma feature so esta pronta quando:

- Tem branch propria.
- Tem testes unitarios ou de API quando aplicavel.
- Tem E2E quando altera fluxo do usuario.
- `npm run check:full` foi executado ou a falha foi explicada.
- Riscos de seguranca foram revisados.
- Relatorio de validacao foi atualizado.
- O modo aprendiz foi entregue.
