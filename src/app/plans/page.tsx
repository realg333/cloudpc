import { getSessionFromCookies } from '@/lib/auth/session';
import { listPlanOptions } from '@/lib/plans/catalog';
import PlanCard from '@/components/PlanCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const session = await getSessionFromCookies();
  const options = await listPlanOptions();

  // Mark the middle option as "featured" (best value) for conversion
  const midIndex = Math.floor(options.length / 2);
  const optionsWithFeatured = options.map((opt, i) => ({
    ...opt,
    featured: i === midIndex,
  }));

  return (
    <div className="dark-plans relative -mt-8 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen overflow-x-hidden bg-[#0a0a0f] text-slate-100">
      {/* Hero - Conversion-focused */}
      <header className="relative overflow-hidden px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        {/* Subtle gradient glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            PC na nuvem com GPU dedicada
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Jogue, edite vídeos e programe em qualquer lugar. Máquinas provisionadas em minutos.
            Pague com PIX ou cripto — sem assinatura.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              São Paulo (GRU)
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Provisionamento automático
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Sem fidelidade
            </span>
          </div>
        </div>
      </header>

      {/* Plans section */}
      <section
        className="relative px-4 pb-16 sm:px-6 lg:px-8"
        aria-label="Planos disponíveis"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-semibold text-slate-300 sm:text-2xl">
              Escolha o plano ideal
            </h2>
            <p className="mt-2 max-w-xl mx-auto text-slate-500">
              Compare perfis de máquina e duração. Todos incluem GPU dedicada e acesso remoto.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {optionsWithFeatured.map((opt) => (
              <PlanCard
                key={`${opt.planId}-${opt.machineProfileId}`}
                planId={opt.planId}
                planName={opt.planName}
                durationHours={opt.durationHours}
                priceCents={opt.priceCents}
                machineProfileId={opt.machineProfileId}
                profileName={opt.profileName}
                gpuTier={opt.gpuTier}
                ramGb={opt.ramGb}
                cpuSummary={opt.cpuSummary}
                featured={opt.featured}
                isLoggedIn={!!session}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Reassurance */}
      <section className="border-t border-white/5 bg-[#0d0d12] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
            Por que escolher
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <TrustPoint
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="Provisionamento rápido"
              description="Máquina pronta em minutos. Sem espera, sem burocracia."
            />
            <TrustPoint
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
              title="Conexão simples"
              description="RDP ou Parsec. Conecte de qualquer dispositivo."
            />
            <TrustPoint
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Pague como quiser"
              description="PIX ou cripto. Cripto com melhor taxa e confirmação rápida."
            />
            <TrustPoint
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
              title="Infraestrutura Brasil"
              description="Servidores em São Paulo. Latência baixa para todo o país."
            />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-t border-white/5 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
            Como funciona
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Step number={1} title="Escolha o plano" description="Selecione o perfil de máquina e a duração que faz sentido para você." />
            <Step number={2} title="Pague e ative" description="PIX ou cripto. Sua máquina é provisionada automaticamente." />
            <Step number={3} title="Conecte e use" description="Acesse via RDP ou Parsec. Jogue, edite, programe." />
          </div>
        </div>
      </section>

      {/* Ideal para */}
      <section className="border-t border-white/5 bg-[#0d0d12] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
            Ideal para
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Pill>Gamers</Pill>
            <Pill>Editores de vídeo</Pill>
            <Pill>Programadores</Pill>
            <Pill>Streamers</Pill>
            <Pill>Designers</Pill>
            <Pill>Power users</Pill>
          </div>
        </div>
      </section>

      {/* FAQ - Objection handling */}
      <section className="border-t border-white/5 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
            Perguntas frequentes
          </h2>
          <dl className="mt-10 space-y-6">
            <FaqItem
              question="Como me conecto à máquina?"
              answer="Via RDP (Windows) ou Parsec. Você recebe o endereço e credenciais após o provisionamento. Conecte de qualquer PC, Mac ou celular."
            />
            <FaqItem
              question="Preciso de assinatura?"
              answer="Não. Você paga pelo tempo que usar. Sem fidelidade, sem mensalidade. Compre horas ou dias conforme sua necessidade."
            />
            <FaqItem
              question="Quanto tempo leva para a máquina ficar pronta?"
              answer="Em geral, menos de 5 minutos. O provisionamento é automático. Você recebe um e-mail quando estiver pronta."
            />
          </dl>
        </div>
      </section>

      {/* CTA for logged-out users */}
      {!session && (
        <section className="border-t border-white/5 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-lg text-slate-400">
              Crie sua conta em segundos e comece a usar.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup?redirect=/plans"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-indigo-600 px-8 font-semibold text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] active:scale-[0.98]"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login?redirect=/plans"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer trust */}
      <footer className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500">
          Pagamento seguro. Máquinas provisionadas na região São Paulo (GRU). Sem fidelidade.
        </p>
      </footer>
    </div>
  );
}

function TrustPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function Step({
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
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-sm font-bold text-indigo-400">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
      {children}
    </span>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <dt className="font-semibold text-white">{question}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-slate-500">{answer}</dd>
    </div>
  );
}
