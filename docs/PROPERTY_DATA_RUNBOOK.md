# Property Data Runbook

Este runbook fecha a etapa tecnica da `feature/property-data` e orienta o cadastro do primeiro imovel real completo.

## Antes de aplicar em producao

1. Revisar `supabase/migrations/20260608185118_property_data_storage.sql`.
2. Confirmar que o bucket `property-images` pode ser publico para leitura.
3. Confirmar que escrita e remocao continuam exclusivas do backend com chave server-side.
4. Aplicar a migration somente depois de aprovacao humana.
5. Rodar os advisors de seguranca do Supabase.
6. Validar que anon/authenticated nao conseguem enviar ou apagar objetos.

## Regras do upload

- Bucket: `property-images`.
- Leitura publica para exibir fotos dos anuncios.
- Escrita e remocao somente pelo backend autenticado.
- Tipos permitidos: JPEG, PNG e WebP.
- Assinatura binaria conferida para impedir arquivo disfarçado.
- Limite: 5 MB por imagem.
- Maximo: 12 imagens por imovel.
- Nome do arquivo gerado pelo servidor.
- Sem sobrescrita: `upsert: false`.
- Primeira URL de `fotos` e armazenada tambem como `foto_principal`.

## Geocodificacao

- ViaCEP preenche endereco, bairro, cidade e estado.
- Nominatim tenta resolver latitude e longitude.
- O endpoint publico do Nominatim exige identificacao por User-Agent e no maximo 1 requisicao por segundo.
- Resultados sao armazenados em cache local por 24 horas.
- `localizacao_aproximada` fica verdadeira por padrao para nao expor endereco exato na pagina publica.

Politicas consultadas:

- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/uploads/standard-uploads
- https://operations.osmfoundation.org/policies/nominatim/

## Primeiro imovel real

Dados necessarios:

```text
titulo
tipo e negocio
preco, area, quartos, banheiros e vagas
condominio e IPTU
CEP, endereco, numero e complemento
bairro, cidade e estado
descricao
1 a 12 fotos autorizadas para publicacao
origem e URL original, quando existirem
```

Checklist:

- Confirmar autorizacao para publicar fotos e dados.
- Evitar exibir endereco exato quando o imovel estiver ocupado.
- Conferir coordenadas antes de publicar.
- Marcar a melhor foto como principal.
- Revisar texto, preco e valores adicionais.
- Abrir a pagina publica e conferir fallback, foto e localizacao.

O cadastro real continua pendente ate que a migration seja aplicada e os dados/fotos reais sejam fornecidos.
