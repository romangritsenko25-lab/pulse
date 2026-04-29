'use client'

import { useRouter } from 'next/navigation'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'навсегда',
    features: ['3 чекина в день', 'AI-анализ базовый', 'История 7 дней'],
    cta: 'Текущий план',
    current: true,
  },
  {
    name: 'Pro',
    price: '299',
    period: 'в месяц',
    features: [
      'Безлимитные чекины',
      'Глубокий AI-анализ',
      'История без ограничений',
      'PDF-отчёты',
      'Персональные инсайты',
      'Экспорт данных',
    ],
    cta: 'Попробовать Pro',
    current: false,
    highlight: true,
  },
]

export default function UpgradePage() {
  const router = useRouter()

  function handleUpgrade() {
    // В реальном приложении здесь будет редирект на LemonSqueezy checkout
    alert('Редирект на LemonSqueezy checkout...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-4">
      <div className="max-w-lg mx-auto py-8">
        <button
          onClick={() => router.back()}
          className="text-violet-400 hover:text-white text-sm mb-8 transition"
        >
          ← Назад
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-1.5 rounded-full mb-4">
            ⭐ Pulse Pro
          </div>
          <h1 className="text-3xl font-bold text-white">Разблокируй полный потенциал</h1>
          <p className="text-violet-400 mt-2">Глубокий AI-анализ и персональные инсайты</p>
        </div>

        <div className="grid gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? 'bg-violet-600/20 border-violet-500 relative'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Рекомендуем
                </div>
              )}

              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-lg font-bold text-white">{plan.name}</div>
                  <div className="text-violet-400 text-sm">{plan.period}</div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-white">₽{plan.price}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="text-violet-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.current ? undefined : handleUpgrade}
                disabled={plan.current}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.current
                    ? 'bg-white/10 text-white/40 cursor-default'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-violet-500 mt-6">
          Безопасная оплата через LemonSqueezy · Отмена в любой момент
        </p>
      </div>
    </div>
  )
}
