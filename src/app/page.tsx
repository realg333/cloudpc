import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Cloud Gaming VPS Brazil
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Acesse um PC na nuvem com GPU para jogos, edição de vídeo e trabalho remoto.
        Escolha seu plano, pague e conecte em minutos — sem complicação.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Entrar
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
