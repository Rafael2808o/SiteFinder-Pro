# SiteFinder Pro

**Encontre empresas locais que ainda não têm site, antes da concorrência.**

O SiteFinder Pro é uma plataforma de prospecção comercial construída com React e TypeScript. Ela busca empresas locais via OpenStreetMap, classifica quem não tem site próprio, pontua o potencial de cada lead, organiza tudo em um CRM e gera mensagem de abordagem e protótipo de site com IA — sem exigir chave do Google nem cartão de crédito.

## Teste o projeto

**[Abrir o SiteFinder Pro](https://sitefinder-pro.onrender.com/)**

O serviço gratuito do Render pode levar alguns segundos para despertar no primeiro acesso. Crie uma conta pela tela de cadastro — não há dados de demonstração pré-carregados, cada conta começa vazia.

## Principais recursos

- busca de empresas locais por cidade, bairro e categoria, via OpenStreetMap (Nominatim + Overpass);
- classificação automática em sem site, possível site (só rede social) ou com site próprio;
- pontuação de potencial do lead (0–100) a partir de avaliações, telefone, Instagram e status do site;
- geração de mensagem de prospecção personalizada por IA, pronta para WhatsApp;
- geração de protótipo de site (identidade visual, copy e seções) por IA, exportável em PDF;
- mapa interativo dos resultados da busca com Leaflet;
- CRM com pipeline de status (novo, contato realizado, respondeu, negociação, cliente...) e anotações por lead;
- exportação da lista de leads para CSV e Excel;
- autenticação e dados isolados por conta via Supabase Auth e Row Level Security.

## Princípios do produto

- **Transparência de dados:** a busca usa OpenStreetMap em vez do Google Places, então não há nota nem número de avaliações do Google — a pontuação de lead já trata isso sem quebrar, em vez de fingir um dado que não existe.
- **Honestidade comercial:** o protótipo gerado por IA é uma peça de demonstração, não um site publicável — a interface deixa isso explícito para quem for usá-lo em uma conversa de venda.
- **Sem raspagem:** nenhum dado vem de scraping do Google Search ou Maps; tudo vem de APIs públicas (OpenStreetMap) ou de IA (Gemini), respeitando os limites de uso de cada uma.
- **Sem fricção de entrada:** nenhuma funcionalidade principal depende de cartão de crédito, cadastro em serviço pago ou chave de API do Google.

## Arquitetura

```text
SiteFinder Pro/
├── src/
│   ├── components/    ui/, layout/, companies/, leads/, prospecting/
│   ├── context/       AuthContext, SearchContext
│   ├── lib/           types, classification (sem/possível/com site), scoring, export, whatsapp
│   ├── pages/         LandingPage, auth/, Dashboard, Search, Results, CompanyDetails, Leads, Crm, Settings
│   ├── services/       places.ts (busca), ai.ts (mensagem/protótipo), leads.ts (CRUD Supabase)
│   └── routes/        ProtectedRoute
├── supabase/
│   ├── migrations/    schema de leads com RLS por usuário
│   └── functions/     places-search, places-photo, generate-message, generate-prototype
└── render.yaml        publicação como Static Site no Render
```

### Tecnologias principais

| Camada | Tecnologias |
| --- | --- |
| Site | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| Mapa e dados | React-Leaflet, Recharts, Papaparse, XLSX, jsPDF/html2canvas |
| Backend | Supabase (Auth + Postgres com RLS), Supabase Edge Functions |
| Busca de empresas | OpenStreetMap — Nominatim (geocodificação) e Overpass API (locais) |
| Inteligência artificial | Gemini (padrão), com suporte a troca de provedor |
| Publicação | Render (Static Site) |

## Comece localmente

Requisitos: Node.js 20+.

```bash
git clone https://github.com/Rafael2808o/SiteFinder-Pro.git
cd SiteFinder-Pro
npm install
```

Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` do seu projeto Supabase. Para linkar o CLI a um projeto Supabase e aplicar a migration:

```bash
supabase login --token <personal-access-token>
supabase link --project-ref <seu-project-ref>
supabase db push
```

Deploy das Edge Functions (secrets `AI_PROVIDER`, `GEMINI_API_KEY`/`OPENAI_API_KEY` já configurados no projeto Supabase):

```bash
supabase functions deploy places-search
supabase functions deploy generate-message
supabase functions deploy generate-prototype
```

Rodar o site:

```bash
npm run dev
```

| Serviço | Endereço local |
| --- | --- |
| Site | `http://localhost:5173` |

## Configuração de produção

O `render.yaml` publica o projeto como Static Site no Render: build `npm install && npm run build`, publica `dist/`, com rewrite `/*` → `/index.html` para as rotas do React Router funcionarem em acesso direto. As duas variáveis (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) são preenchidas no dashboard do Render ao importar o Blueprint. Nunca envie o `.env` ao Git.

## Funções e dados

Não há uma API REST própria — o frontend fala diretamente com Supabase (tabela `leads`, protegida por RLS) e com as Edge Functions abaixo, que atuam como proxy seguro para que as chaves de IA e de busca nunca cheguem ao navegador.

| Função | Responsabilidade |
| --- | --- |
| `places-search` | Busca empresas locais via Nominatim + Overpass (OpenStreetMap) |
| `generate-message` | Gera mensagem de prospecção personalizada por IA |
| `generate-prototype` | Gera briefing estruturado do protótipo de site por IA |
| `places-photo` | Repassa foto do Google Places quando essa fonte estiver habilitada (hoje sem uso) |

## Segurança e privacidade

- autenticação via Supabase Auth, com sessão isolada por usuário;
- Row Level Security no Postgres: cada conta só lê, cria, edita e apaga os próprios leads;
- chaves de IA e de busca nunca chegam ao navegador — ficam só nas Edge Functions;
- `.env`, chaves e tokens não são versionados.

## Estado do projeto

A branch `master` é a fonte de publicação, hospedada no Render. A busca depende da disponibilidade pública dos servidores Overpass (`places-search` já tenta 3 espelhos em sequência antes de falhar) e da cobertura de cada região no OpenStreetMap — cidades maiores tendem a ter mais estabelecimentos mapeados que cidades pequenas. Não há sistema de cobrança implementado: o uso hoje é livre.

## Contribuição

1. Crie uma branch a partir de `master`.
2. Faça alterações pequenas e objetivas.
3. Rode `npm run build` e `npm run lint` antes de abrir a alteração.
4. Não envie segredos, arquivos `.env` ou builds locais.
5. Descreva o que mudou, por quê, e como foi validado.

## Fontes

- https://nominatim.org/release-docs/latest/api/Overview/
- https://wiki.openstreetmap.org/wiki/Overpass_API
