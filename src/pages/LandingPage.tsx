import { Link, Navigate } from 'react-router-dom'
import {
  MapPin,
  Filter,
  TrendingUp,
  Sparkles,
  MessageCircle,
  KanbanSquare,
  Download,
  ShieldCheck,
  ArrowRight,
  Search,
  Wand2,
  Send,
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { SiteStatusBadge } from '../components/companies/SiteStatusBadge'
import { LeadScoreBadge } from '../components/companies/LeadScoreBadge'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: MapPin,
    title: 'Busca por cidade ou bairro',
    desc: 'Encontre empresas locais reais via OpenStreetMap — sem chave de API, sem cartão de crédito.',
  },
  {
    icon: Filter,
    title: 'Classificação automática',
    desc: 'Cada empresa é marcada como sem site, com apenas redes sociais, ou com site próprio.',
  },
  {
    icon: TrendingUp,
    title: 'Pontuação de potencial',
    desc: 'Avaliações, telefone e presença online viram uma nota de 0 a 100 pra você priorizar quem abordar.',
  },
  {
    icon: Wand2,
    title: 'Protótipo de site com IA',
    desc: 'Gere uma demonstração visual do site que o lead ainda não tem, pronta pra mostrar em uma conversa.',
  },
  {
    icon: MessageCircle,
    title: 'Mensagem de prospecção pronta',
    desc: 'IA escreve uma abordagem personalizada pra cada lead, pronta pra enviar por WhatsApp.',
  },
  {
    icon: KanbanSquare,
    title: 'CRM com pipeline',
    desc: 'Organize contato feito, em negociação e fechado — tudo no mesmo lugar, sem planilha.',
  },
  {
    icon: Download,
    title: 'Exportação livre',
    desc: 'Leva sua lista de leads pra CSV ou Excel quando quiser, sem trava de plano.',
  },
  {
    icon: ShieldCheck,
    title: 'Dados de verdade',
    desc: 'Zero scraping do Google. Só APIs públicas (OpenStreetMap + IA), com honestidade sobre o que falta.',
  },
]

const STEPS = [
  {
    icon: Search,
    title: 'Busque uma região',
    desc: 'Escolha cidade, bairro e o tipo de negócio. A busca roda em segundos via Nominatim + Overpass.',
  },
  {
    icon: TrendingUp,
    title: 'Veja quem não tem site',
    desc: 'A lista já chega classificada e pontuada. Filtre pelos leads com maior potencial de fechamento.',
  },
  {
    icon: Send,
    title: 'Aborde com IA e feche no CRM',
    desc: 'Gere mensagem e protótipo com um clique, envie por WhatsApp e acompanhe o negócio até fechar.',
  },
]

const FAQS = [
  {
    q: 'Preciso de cartão de crédito ou chave de API do Google?',
    a: 'Não. A busca usa OpenStreetMap (Nominatim + Overpass), que é gratuito e não exige cadastro nem cartão. Você só precisa criar sua conta no SiteFinder Pro.',
  },
  {
    q: 'De onde vêm os dados das empresas?',
    a: 'De APIs públicas do OpenStreetMap. Isso significa que não há nota nem número de avaliações do Google — nesses casos o critério simplesmente vale 0 pontos na pontuação, sem quebrar nada.',
  },
  {
    q: 'O protótipo de site gerado por IA é publicável?',
    a: 'Não. É uma peça de demonstração comercial — identidade visual, copy e layout pensados pra você mostrar ao lead o que ele está perdendo. Deixe isso claro na conversa.',
  },
  {
    q: 'Funciona pra qualquer cidade do Brasil?',
    a: 'Sim, a cobertura depende do cadastro de cada região no OpenStreetMap. Cidades maiores tendem a ter mais estabelecimentos mapeados que cidades pequenas.',
  },
  {
    q: 'Os dados dos leads e do CRM ficam salvos?',
    a: 'Sim. Tudo fica no seu banco Supabase, protegido por autenticação e Row Level Security — só você acessa os seus leads.',
  },
]

export function LandingPage() {
  const { user, loading } = useAuth()

  if (!loading && user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Transparency />
      <Cta />
      <Faq />
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700">
            <Logo size={17} className="text-white" accent="#0f766e" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">SiteFinder Pro</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#como-funciona" className="hover:text-teal-700">
            Como funciona
          </a>
          <a href="#recursos" className="hover:text-teal-700">
            Recursos
          </a>
          <a href="#faq" className="hover:text-teal-700">
            Perguntas frequentes
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/cadastro">
            <Button size="sm">Criar conta grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Badge tone="teal">Busca gratuita via OpenStreetMap</Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Encontre empresas que ainda não têm site — antes da concorrência.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
            SiteFinder Pro busca negócios locais, mostra quem não tem site próprio, pontua o
            potencial de cada lead e gera mensagem + protótipo com IA pra você fechar mais rápido.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/cadastro">
              <Button size="lg" icon={<ArrowRight size={18} />} className="flex-row-reverse">
                Criar conta grátis
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="secondary">
                Ver como funciona
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Sem cartão de crédito · Sem chave de API do Google · Pronto em minutos
          </p>
        </div>

        <HeroMock />
      </div>
    </section>
  )
}

function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-teal-100 via-white to-slate-100 blur-2xl" />
      <Card className="overflow-hidden p-0 shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2 text-xs text-slate-400">Resultados — Porto Alegre, RS</span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {[
            { name: 'Padaria Bela Vista', category: 'Padaria', status: 'sem_site' as const, score: 84 },
            { name: 'Studio Ana Corte & Cor', category: 'Salão de beleza', status: 'possivel_site' as const, score: 63 },
            { name: 'Clínica Odonto Sorriso', category: 'Dentista', status: 'com_site' as const, score: 22 },
          ].map((lead) => (
            <div
              key={lead.name}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.category}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SiteStatusBadge status={lead.status} />
                <LeadScoreBadge score={lead.score} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base text-slate-600">{desc}</p>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Como funciona"
          title="Da busca ao fechamento, em três passos"
          desc="Sem planilha, sem raspagem de dados, sem depender de cadastro em serviço pago."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white">
                <step.icon size={22} />
              </div>
              <p className="mt-4 text-xs font-semibold text-teal-700">PASSO {String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="recursos" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Recursos"
          title="Tudo que uma prospecção comercial precisa"
          desc="Do primeiro filtro de busca até o lead virar cliente fechado no CRM."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Transparency() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge tone="teal">Transparência de dados</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Gratuito de verdade porque a fonte de dados é aberta
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              A busca usa OpenStreetMap (Nominatim + Overpass) em vez do Google Places. Isso
              elimina a exigência de cartão de faturamento, mas tem trade-offs — e preferimos ser
              claros sobre eles em vez de esconder.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={16} />
                Sem nota nem número de avaliações do Google — a pontuação de lead já trata isso
                sem quebrar.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={16} />
                Sem fotos reais do estabelecimento no protótipo gerado por IA.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={16} />
                Zero scraping do Google Search ou Maps — tudo via API pública, respeitando limites
                de uso.
              </li>
            </ul>
          </div>
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fonte dos dados
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-600">Localização e endereços</span>
                <span className="text-sm font-semibold text-slate-900">OSM Nominatim</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-600">Empresas próximas</span>
                <span className="text-sm font-semibold text-slate-900">OSM Overpass</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-600">Mensagem e protótipo</span>
                <span className="text-sm font-semibold text-slate-900">IA (Gemini)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Custo por busca</span>
                <span className="text-sm font-semibold text-emerald-700">R$ 0,00</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-teal-700 px-6 py-14 text-center sm:px-14">
          <Sparkles className="text-teal-200" size={28} />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Comece a prospectar hoje mesmo
          </h2>
          <p className="max-w-xl text-teal-50">
            Crie sua conta, escolha uma cidade e veja em minutos quantos negócios ao seu redor
            ainda não têm site.
          </p>
          <Link to="/cadastro">
            <Button
              size="lg"
              variant="secondary"
              icon={<ArrowRight size={18} />}
              className="flex-row-reverse !border-transparent !bg-white !text-teal-800 hover:!bg-teal-50"
            >
              Criar conta grátis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section id="faq" className="border-t border-slate-100 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Perguntas frequentes"
          title="Antes de começar"
          desc="Se sua dúvida não estiver aqui, entre em contato depois de criar sua conta."
        />
        <div className="mt-10 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {FAQS.map((item) => (
            <details key={item.q} className="group p-5 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
                {item.q}
                <span className="ml-4 shrink-0 text-slate-400 transition-transform group-open:rotate-45">
                  <PlusIcon />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-700">
                <Logo size={15} className="text-white" accent="#0f766e" />
              </div>
              <span className="text-sm font-semibold text-slate-900">SiteFinder Pro</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Prospecção comercial focada em negócios locais sem site próprio, com pontuação de
              lead e IA para abordagem.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-slate-900">Produto</p>
              <ul className="mt-3 space-y-2 text-slate-500">
                <li>
                  <a href="#como-funciona" className="hover:text-teal-700">
                    Como funciona
                  </a>
                </li>
                <li>
                  <a href="#recursos" className="hover:text-teal-700">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-teal-700">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Conta</p>
              <ul className="mt-3 space-y-2 text-slate-500">
                <li>
                  <Link to="/login" className="hover:text-teal-700">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to="/cadastro" className="hover:text-teal-700">
                    Criar conta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} SiteFinder Pro. Dados via OpenStreetMap. Nenhuma raspagem de
          Google Search ou Maps.
        </div>
      </div>
    </footer>
  )
}
