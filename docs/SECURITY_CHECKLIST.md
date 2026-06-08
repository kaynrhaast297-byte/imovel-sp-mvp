# Security Checklist

Use este checklist antes de abrir PRs que toquem escrita, upload, auth, Supabase, APIs ou dados sensiveis.

## Upload de fotos

- Tamanho maximo definido.
- Tipos permitidos: `jpg`, `jpeg`, `png`, `webp`.
- Nome seguro do arquivo.
- Sem sobrescrever imagem existente por acidente.
- Bucket com permissao minima necessaria.
- Validacao server-side antes do upload.
- Limite de quantidade por imovel.
- Foto principal definida de forma explicita.

## Endereco e CEP

- CEP invalido rejeitado.
- Endereco incompleto rejeitado no admin.
- Numero obrigatorio quando o imovel tiver endereco exato.
- Cidade e bairro consistentes com o CEP quando possivel.
- Endereco exato nao exposto quando o produto exigir privacidade.

## Geocodificacao

- Falha da API externa tratada sem quebrar cadastro.
- Timeout configurado.
- Coordenadas aproximadas marcadas com `localizacao_aproximada`.
- Cache ou persistencia para evitar chamadas repetidas.
- Nao revelar endereco exato quando houver risco de privacidade.

## Admin

- Sessao administrativa via cookie HttpOnly.
- Sem Bearer token persistido no browser.
- Validacao Zod server-side.
- Erros sem vazamento de segredo, SQL ou stack trace sensivel.
- Rate limit quando fizer sentido.
- Chave `service_role` somente no servidor.

## Pagina publica

- Fallback sem foto.
- Fallback sem mapa.
- Dados do imovel sanitizados.
- Acessibilidade basica validada.
- Responsividade validada.
- SEO basico sem dados sensiveis.

## Prompt de revisao Ollama

```text
Revise a branch [nome] do projeto ImovelSP.
Procure falhas de seguranca, bugs, problemas de validacao, edge cases,
testes faltando e riscos em [dominio da feature].
```
