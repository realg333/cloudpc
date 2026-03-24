import Link from 'next/link';
import {
  Cpu,
  Zap,
  Clock,
  Gamepad2,
  Video,
  Code2,
  Layers,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="dark-layout home-shell relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen overflow-x-hidden text-slate-100">
      <a
        href="#hero"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:w-auto focus:h-auto focus:overflow-visible focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:[clip:auto]"
      >
        Pular para o conteúdo principal
      </a>
      <HomeAmbient />

      {/* 1. Hero */}
      <section
        id="hero"
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8"
        aria-label="Hero"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              PC na nuvem com GPU dedicada
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Jogue, edite, programe.
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
                Em qualquer lugar.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl lg:mx-0">
              Acesse um PC potente na nuvem em minutos. GPU dedicada, baixa latência,
              infraestrutura no Brasil. Sem assinatura — pague só pelo que usar.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/plans"
                className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_6px_28px_rgba(99,102,241,0.45)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 hover:shadow-[0_8px_34px_rgba(99,102,241,0.52)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
              >
                Ver planos
                <ChevronRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="#how-it-works-heading"
                className="inline-flex min-h-[52px] min-w-[160px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 font-semibold text-slate-300 transition-all duration-200 hover:border-indigo-400/35 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506]"
              >
                Como funciona
              </Link>
            </div>
          </div>
          <HeroMotionRail />
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-black/20 py-3" aria-label="Tech ticker">
        <div className="home-ticker-mask">
          <div className="home-ticker-track">
            {[
              'Cloud PC no Brasil',
              'GPU dedicada',
              'Ativação em minutos',
              'PIX e cripto',
              'Sem fidelidade',
              'Baixa latência',
            ].map((text, index) => (
              <span
                key={`${text}-${index}`}
                className="inline-flex items-center gap-3 px-6 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/90"
              >
                <span className="h-1 w-1 rounded-full bg-violet-300" />
                {text}
              </span>
            ))}
            {[
              'Cloud PC no Brasil',
              'GPU dedicada',
              'Ativação em minutos',
              'PIX e cripto',
              'Sem fidelidade',
              'Baixa latência',
            ].map((text, index) => (
              <span
                key={`dup-${text}-${index}`}
                className="inline-flex items-center gap-3 px-6 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/90"
              >
                <span className="h-1 w-1 rounded-full bg-violet-300" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section
        id="trust-strip"
        className="relative z-10 border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Credibilidade"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 sm:gap-4">
          <TrustPill>Infraestrutura no Brasil</TrustPill>
          <TrustPill>Provisionamento rápido</TrustPill>
          <TrustPill>PIX e cripto</TrustPill>
          <TrustPill>Sem fidelidade</TrustPill>
          <TrustPill>Ativação em minutos</TrustPill>
          <TrustPill>Suporte a jogos, edição e programação</TrustPill>
        </div>
      </section>

      {/* 3. Value explanation */}
      <section
        className="relative z-10 border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="value-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2 id="value-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            O que é um Cloud PC?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-slate-300">
            Um PC completo rodando na nuvem. Você conecta de qualquer dispositivo — notebook,
            tablet, celular — e usa como se fosse sua máquina local. Só que mais potente.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <ValueCard
              title="Melhor que PC local"
              items={[
                'Sem investir em hardware caro',
                'Atualizações automáticas de GPU',
                'Escale conforme precisar',
                'Acesse de qualquer lugar',
              ]}
            />
            <ValueCard
              title="Ideal para workloads pesados"
              items={[
                'Jogos AAA em ultra',
                'Edição 4K em tempo real',
                'Compilação e IDEs pesadas',
                'Renderização e ML',
              ]}
            />
          </div>
        </div>
      </section>

      {/* 4. Use cases */}
      <section
        className="relative z-10 border-t border-white/5 bg-[#0a0a0c]/85 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="use-cases-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="use-cases-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            Feito para você
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-300">
            Cada perfil com os recursos certos para o seu uso.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <UseCaseCard
              icon={<Gamepad2 className="h-6 w-6" />}
              title="Gamers"
              description="Jogue os últimos lançamentos em ultra. Latência baixa, FPS estável, sem lag."
            />
            <UseCaseCard
              icon={<Video className="h-6 w-6" />}
              title="Editores de vídeo"
              description="Edite 4K em tempo real. Exporte rápido. Sem travar sua máquina."
            />
            <UseCaseCard
              icon={<Code2 className="h-6 w-6" />}
              title="Programadores"
              description="Ambientes isolados, builds rápidos, múltiplas VMs. IDE fluida."
            />
            <UseCaseCard
              icon={<Layers className="h-6 w-6" />}
              title="Power users"
              description="Virtualização, testes, workloads pesados. Tudo em um clique."
            />
          </div>
        </div>
      </section>

      {/* 5. How it works */}
      <section
        className="relative z-10 border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2 id="how-it-works-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-300">
            Três passos. Sem burocracia.
          </p>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <StepCard
              number={1}
              title="Escolha"
              description="Selecione o perfil de máquina e a duração. GPU, RAM e CPU definidos."
            />
            <StepCard
              number={2}
              title="Pague"
              description="PIX ou cripto. Pagamento confirmado e a máquina é provisionada na hora."
            />
            <StepCard
              number={3}
              title="Conecte"
              description="RDP ou Parsec. Conecte de qualquer dispositivo e use."
            />
          </div>
        </div>
      </section>

      {/* 6. Performance / power */}
      <section
        className="relative z-10 border-t border-white/5 bg-[#0a0a0c]/85 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="performance-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="performance-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            Potência real
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-300">
            GPU dedicada, latência baixa, performance consistente.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <PerfCard
              icon={<Cpu className="h-6 w-6" />}
              label="GPU dedicada"
              value="NVIDIA"
              description="Sem compartilhamento. Toda a GPU é sua."
            />
            <PerfCard
              icon={<Zap className="h-6 w-6" />}
              label="Latência"
              value="< 20ms"
              description="Infra em São Paulo. Resposta instantânea."
            />
            <PerfCard
              icon={<Clock className="h-6 w-6" />}
              label="Provisionamento"
              value="< 5 min"
              description="Máquina pronta em minutos, não em horas."
            />
          </div>
        </div>
      </section>

      {/* 7. Plans preview */}
      <section
        className="relative z-10 border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="plans-heading"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="plans-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Planos sob medida
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Escolha o perfil de máquina e a duração. Todos incluem GPU dedicada e acesso remoto.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-slate-300">
            <span className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium">
              A partir de horas
            </span>
            <span className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium">
              GPU dedicada
            </span>
            <span className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium">
              RDP + Parsec
            </span>
          </div>
          <Link
            href="/plans"
            className="mt-10 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_6px_28px_rgba(99,102,241,0.45)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
          >
            Ver todos os planos
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section
        className="relative z-10 border-t border-white/5 px-4 py-24 sm:px-6 lg:px-8"
        aria-label="Chamada final"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Crie sua conta, escolha seu plano e conecte em minutos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_6px_28px_rgba(99,102,241,0.45)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 hover:shadow-[0_8px_34px_rgba(99,102,241,0.52)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
            >
              Ver planos e preços
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/signup?redirect=/plans"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 font-semibold text-slate-300 transition-all duration-200 hover:border-indigo-400/35 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#050506]"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-300">
          Pagamento seguro · Infraestrutura São Paulo (GRU) · Sem fidelidade
        </p>
      </footer>
    </div>
  );
}

function HomeAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="home-gradient-orb home-gradient-orb-a" />
      <div className="home-gradient-orb home-gradient-orb-b" />
      <div className="home-grid-layer" />
      <div className="home-scanline-layer" />
      <div className="home-noise-layer" />
    </div>
  );
}

function HeroMotionRail() {
  const cards = [
    {
      title: 'Ativação em minutos',
      description: 'Provisionamento rápido com fluxo simples.',
    },
    {
      title: 'GPU dedicada',
      description: 'Performance consistente para jogos e criação.',
    },
    {
      title: 'Conexão remota fluida',
      description: 'Acesse via RDP e Parsec de qualquer lugar.',
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-indigo-400/20 bg-black/35 p-4 shadow-[0_30px_90px_rgba(64,0,128,0.35)] backdrop-blur-md">
      <div className="home-hero-rail-track">
        {[...cards, ...cards].map((card, index) => (
          <article
            key={`${card.title}-${index}`}
            className="home-hero-rail-card shrink-0 rounded-2xl border border-white/10 bg-[#0b0b12]/85 p-5"
          >
            <h3 className="text-sm font-semibold text-indigo-200">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TrustPill({ children }: { children: string }) {
  return (
    <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm">
      {children}
    </span>
  );
}

function ValueCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="home-glass-card rounded-2xl p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="home-glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/35">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/35 bg-indigo-500/15 text-xl font-bold text-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.24)]">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

function PerfCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="home-glass-card rounded-2xl p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

