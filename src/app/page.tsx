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
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="dark-layout relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen overflow-x-hidden bg-[#050506] text-slate-100">
      <a
        href="#hero"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:w-auto focus:h-auto focus:overflow-visible focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:[clip:auto]"
      >
        Pular para o conteúdo principal
      </a>
      {/* Ambient gradient orbs */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(249, 115, 22, 0.08) 0%, transparent 40%)',
        }}
      />

      {/* 1. Hero */}
      <section
        id="hero"
        className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-400">
            PC na nuvem com GPU dedicada
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Jogue, edite, programe.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Em qualquer lugar.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Acesse um PC potente na nuvem em minutos. GPU dedicada, baixa latência,
            infraestrutura no Brasil. Sem assinatura — pague só pelo que usar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 hover:shadow-[0_6px_28px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
            >
              Ver planos
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="#how-it-works-heading"
              className="inline-flex min-h-[52px] min-w-[160px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506]"
            >
              Como funciona
            </Link>
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
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            Infraestrutura no Brasil
          </span>
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            Provisionamento rápido
          </span>
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            PIX e cripto
          </span>
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            Sem fidelidade
          </span>
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            Ativação em minutos
          </span>
          <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 backdrop-blur-sm">
            Suporte a jogos, edição e programação
          </span>
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
          <p className="mx-auto mt-6 max-w-2xl text-center text-slate-400">
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
        className="relative z-10 border-t border-white/5 bg-[#0a0a0c] px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="use-cases-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="use-cases-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            Feito para você
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
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
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
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
        className="relative z-10 border-t border-white/5 bg-[#0a0a0c] px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="performance-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="performance-heading" className="text-center text-2xl font-bold text-white sm:text-3xl">
            Potência real
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
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
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Escolha o perfil de máquina e a duração. Todos incluem GPU dedicada e acesso remoto.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-slate-300">
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium">
              A partir de horas
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium">
              GPU dedicada
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium">
              RDP + Parsec
            </span>
          </div>
          <Link
            href="/plans"
            className="mt-10 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
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
          <p className="mt-4 text-lg text-slate-400">
            Crie sua conta, escolha seu plano e conecte em minutos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 hover:shadow-[0_6px_28px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#050506] active:scale-[0.98]"
            >
              Ver planos e preços
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/signup?redirect=/plans"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#050506]"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-400">
          Pagamento seguro · Infraestrutura São Paulo (GRU) · Sem fidelidade
        </p>
      </footer>
    </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-indigo-500/30 hover:bg-white/[0.07]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-xl font-bold text-indigo-400">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

