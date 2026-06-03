# Roadmap do Imovel SP MVP

## Norte do produto

Construir uma plataforma imobiliaria que comece como um portal simples e evolua para multi-imobiliaria, com sites proprios para parceiros, leads, servicos residenciais e, depois, IA.

## O que ja existe

- Site Next.js publicado na Vercel.
- Home, busca e pagina de detalhe do imovel.
- Painel admin simples para cadastrar imoveis.
- Supabase/Postgres com tabela `imoveis`.
- Analise basica de preco por imoveis similares.
- Dependencias instaladas para formularios, validacao, icones, carrossel e cache.

## Regras de foco

- Nao instalar bibliotecas sem uma funcionalidade clara.
- Entregar uma melhoria pequena por vez.
- Sempre testar com `npm run lint` e `npm run type-check` antes de publicar.
- Nao usar IA paga ate o fluxo principal do produto estar funcionando.
- Nunca carregar milhares de imoveis de uma vez no frontend.

## Mes 1: MVP estavel

- Melhorar home, busca, detalhe e responsividade.
- Criar formulario de lead no detalhe do imovel.
- Salvar leads no Supabase.
- Organizar README e variaveis de ambiente.
- Adicionar paginacao na busca.
- Revisar schema e indices iniciais.

## Mes 2: Multi-imobiliaria

- Criar tabela `organizations`.
- Adicionar `organization_id` em `imoveis` e `leads`.
- Criar tabela `sites`.
- Criar rota publica `/site/[slug]`.
- Criar login real com Supabase Auth.
- Proteger admin por organizacao.
- Comecar RLS multi-tenant.

## Mes 3: Parceiros e escala

- Criar categorias de servicos.
- Criar parceiros: pintores, marceneiros, eletricistas, fotografos etc.
- Relacionar parceiros por cidade/bairro.
- Criar leads para parceiros.
- Testar busca com massa fake grande.
- Melhorar indices para 32 mil+ imoveis.
- Revisar SEO, mobile, loading e empty states.

## Proxima entrega pequena

Formulario de contato no detalhe do imovel usando React Hook Form + Zod, com envio para `POST /api/leads` e persistencia na tabela `leads`.
