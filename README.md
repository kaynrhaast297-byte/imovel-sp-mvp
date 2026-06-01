# Imóvel SP MVP - Comparador de Preços

Plataforma para comparação de preços de imóveis em São Paulo (MVP).

## 🎯 Fase 1 (MVP)

- Busca por imóveis (bairro, faixa de preço, tipo, quartos)
- Listagem com cards informativos
- Página de detalhes do imóvel
- Análise de preço justo (comparação com média do bairro)
- Painel administrativo para entrada manual de imóveis
- API REST para CRUD de imóveis

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📋 Stack Tecnológico

- Next.js 16.2 + React 19 + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS 4
- MeiliSearch (busca)
- OpenStreetMap (mapa)

## 📁 Estrutura de Pastas

```
app/
├── layout.tsx          # Layout raiz
├── page.tsx            # Home com busca
├── globals.css         # Estilos globais
├── imovel/
│   └── [id]/
│       └── page.tsx    # Detalhes do imóvel
├── admin/
│   ├── layout.tsx      # Layout admin
│   └── page.tsx        # Formulário de entrada
└── api/
    ├── imoveis/
    │   ├── route.ts    # GET/POST imoveis
    │   └── [id]/
    │       └── route.ts # GET/PUT/DELETE imovel
    └── analise/
        └── route.ts    # Análise de preço

components/
├── SearchForm.tsx      # Formulário de busca
├── ImovelCard.tsx      # Card do imóvel
├── PriceAnalysis.tsx   # Análise de preço
└── Map.tsx             # Mapa OpenStreetMap

lib/
├── supabase.ts         # Cliente Supabase
├── types.ts            # Tipos TypeScript
└── utils.ts            # Funções utilitárias
```

## ⚙️ Configuração

Crie `.env.local` com:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
