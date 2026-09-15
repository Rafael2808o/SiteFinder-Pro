# SiteFinder Pro

Plataforma de prospecção comercial: busca empresas locais (via OpenStreetMap), identifica quais não têm site próprio, pontua o potencial de cada lead, organiza tudo em um CRM simples e gera mensagem de prospecção + protótipo de site com IA a partir de dados públicos.

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- React Router, Recharts (dashboard), React-Leaflet (mapa)
- Supabase (Auth + Postgres com RLS por usuário)
- Supabase Edge Functions como proxy seguro para busca de empresas e IA (as chaves nunca chegam ao navegador)

## Fonte de dados: OpenStreetMap (grátis, sem key, sem cartão)

A busca usa **Nominatim** (geocodifica cidade/bairro) + **Overpass API** (retorna empresas próximas por tags — `shop`, `office`, `amenity`, `craft`). Zero custo, zero cadastro. Trade-off consciente vs. Google Places:

- **Sem nota/número de avaliações** — OSM não tem esse dado. A pontuação de lead (`lib/scoring.ts`) já trata isso (rating ausente = 0 pontos naquele critério, não quebra).
- **Sem fotos** — o protótipo de site é gerado só com identidade visual + copy, sem foto real do estabelecimento (o layout já lida com isso, só omite a seção de foto).
- **Instagram/Facebook aparecem com mais frequência que no Google Places** (que não expõe esses campos) — vêm de `contact:instagram`/`contact:facebook` quando o estabelecimento tem esse dado no OSM.
- **Endereço pode vir incompleto** para estabelecimentos com cadastro OSM pobre — nunca é inventado, só fica mais curto.
- O servidor público principal do Overpass (`overpass-api.de`) é instável sob carga; `places-search` já tenta 3 espelhos em sequência (`overpass.kumi.systems`, `overpass.private.coffee`) antes de falhar.

Se no futuro quiser voltar pro Google Places (mais dado, exige cartão de faturamento no Google Cloud), o proxy é isolado em `supabase/functions/places-search/index.ts` — trocar a implementação ali não exige tocar no frontend, que já consome só os campos normalizados (`services/places.ts`).

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Projeto Supabase

Já configurado neste projeto (ref `bprxnnoosqlyaoxiaocy`, região us-east-1). `.env` já preenchido com `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.

Para linkar em outra máquina:

```bash
supabase login --token <personal-access-token>
supabase link --project-ref bprxnnoosqlyaoxiaocy
```

### 3. Migration

Já aplicada (tabela `leads` com RLS por usuário). Pra reaplicar/atualizar:

```bash
supabase db push
```

### 4. Secrets e Edge Functions

Já deployadas: `places-search`, `places-photo` (não usada hoje, fica pronta pra voltar a usar fotos se trocar de fonte de dados), `generate-message`, `generate-prototype`.

Secrets já setados: `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-flash-latest`.

Pra redeployar depois de mudar código:

```bash
supabase functions deploy places-search
supabase functions deploy generate-message
supabase functions deploy generate-prototype
```

Pra trocar de provedor de IA:

```bash
supabase secrets set AI_PROVIDER=openai
supabase secrets set OPENAI_API_KEY=sua-chave
```

### 5. Rodar localmente

```bash
npm run dev
```

## Limitações importantes (honestidade sobre a fonte de dados)

- Ver seção "Fonte de dados" acima — sem nota/avaliações/fotos, por escolha deliberada de não exigir cartão de crédito do Google Cloud.
- O protótipo de site é uma peça de **demonstração comercial** (briefing de identidade visual + copy + layout), não um site publicável — deixe isso claro ao mostrar para o lead.
- Nenhum dado é raspado (scraping) do Google Search/Maps: tudo vem de APIs públicas próprias (OpenStreetMap Nominatim/Overpass, Gemini), respeitando os limites de uso de cada uma.

## Estrutura

```
src/
  components/    ui/, layout/, companies/, leads/, prospecting/
  context/       AuthContext, SearchContext
  lib/           types, classification (sem/possível/com site), scoring (potencial do lead), export, whatsapp
  pages/         auth/, Dashboard, Search, Results, CompanyDetails, Leads, Crm, Settings
  services/      places.ts (busca), ai.ts (mensagem/protótipo), leads.ts (CRUD Supabase)
  routes/        ProtectedRoute
supabase/
  migrations/    schema de leads com RLS
  functions/     places-search (OSM), places-photo (Google Places, hoje sem uso), generate-message, generate-prototype (Gemini/OpenAI)
```
