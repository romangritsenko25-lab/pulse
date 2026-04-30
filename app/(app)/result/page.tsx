'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────
interface AnalysisData {
  id: string
  crisis?: boolean
  reflection?: string
  patterns?: string
  hypothesis?: string
  forSpecialist?: string[]
  support?: string
  form?: Record<string, unknown>
}

// ── Section component ──────────────────────────────────────────────────────
function Section({
  badge,
  title,
  color,
  children,
}: {
  badge: string
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest opacity-60">{badge}</span>
        <span className="text-xs font-medium opacity-50">·</span>
        <span className="text-sm font-semibold opacity-80">{title}</span>
      </div>
      {children}
    </div>
  )
}

// ── Crisis screen ──────────────────────────────────────────────────────────
function CrisisView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-red-700 mb-3">Ты не один(а)</h2>
        <p className="text-slate-700 text-sm leading-relaxed mb-5">
          Я вижу, что тебе сейчас очень тяжело. Пожалуйста, позвони на линию поддержки — это бесплатно и анонимно. Там есть люди, которые умеют слушать.
        </p>
        <div className="flex flex-col gap-3">
          {[
            { number: '150', label: 'Казахстан', href: 'tel:150' },
            { number: '8-800-2000-122', label: 'Россия', href: 'tel:88002000122' },
            { number: '7333', label: 'Украина', href: 'tel:7333' },
          ].map((r) => (
            <a
              key={r.number}
              href={r.href}
              className="flex items-center gap-3 bg-white border border-red-100 rounded-xl px-4 py-3 text-red-700 font-semibold hover:bg-red-50 transition"
            >
              <span className="text-xl">📞</span>
              <div>
                <div className="font-bold text-sm">{r.number}</div>
                <div className="text-xs text-slate-500">{r.label} — бесплатно, круглосуточно</div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <button onClick={onBack} className="text-slate-400 text-sm text-center hover:text-slate-600 transition">
        ← Вернуться
      </button>
    </div>
  )
}

// ── Main content ───────────────────────────────────────────────────────────
function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [data, setData] = useState<AnalysisData | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!id) { router.replace('/checkin'); return }
    const raw = sessionStorage.getItem(`pulse_checkin_${id}`)
    if (raw) setData(JSON.parse(raw))
    else router.replace('/checkin')
  }, [id, router])

  async function handleDownloadPdf() {
    if (!data) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('pdf_failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `metanoia-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse text-sm">Загрузка…</p>
      </div>
    )
  }

  if (data.crisis) {
    return <CrisisView onBack={() => router.push('/checkin')} />
  }

  const dateStr = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Metanoia AI</p>
            <h1 className="text-2xl font-bold text-slate-800 mt-0.5">Твой анализ</h1>
            <p className="text-slate-400 text-sm mt-0.5">{dateStr}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-600 text-sm transition mt-1"
          >
            Дашборд →
          </button>
        </div>

        {/* Section 1 — Reflection */}
        {data.reflection && (
          <Section badge="01" title="Отражение" color="bg-blue-50 border-blue-100 text-blue-900">
            <p className="text-sm leading-relaxed">{data.reflection}</p>
          </Section>
        )}

        {/* Section 2 — Patterns */}
        {data.patterns && (
          <Section badge="02" title="Паттерны" color="bg-teal-50 border-teal-100 text-teal-900">
            <p className="text-sm leading-relaxed">{data.patterns}</p>
          </Section>
        )}

        {/* Section 3 — Hypothesis */}
        {data.hypothesis && (
          <Section badge="03" title="Гипотеза" color="bg-violet-50 border-violet-100 text-violet-900">
            <p className="text-sm leading-relaxed italic">{data.hypothesis}</p>
          </Section>
        )}

        {/* Section 4 — For Specialist */}
        {data.forSpecialist && data.forSpecialist.length > 0 && (
          <Section badge="04" title="Темы для специалиста" color="bg-amber-50 border-amber-100 text-amber-900">
            <ul className="flex flex-col gap-2">
              {data.forSpecialist.map((topic, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Section 5 — Support */}
        {data.support && (
          <div className="bg-gradient-to-br from-indigo-500 to-teal-500 rounded-2xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">05 · Поддержка</p>
            <p className="text-sm leading-relaxed font-medium">{data.support}</p>
          </div>
        )}

        {/* PDF Download */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Скачать PDF для приёма</p>
            <p className="text-slate-400 text-xs mt-0.5">Покажи специалисту — это сэкономит время на объяснения</p>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            {pdfLoading ? (
              <><span className="animate-spin inline-block">⏳</span> Генерируем…</>
            ) : (
              <>↓ Скачать PDF</>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/checkin')}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
          >
            Пройти ещё раз
          </button>
        </div>

        <p className="text-slate-300 text-xs text-center leading-relaxed">
          Составлено AI-ассистентом Metanoia AI.<br />
          Не является медицинским заключением.
        </p>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse text-sm">Загрузка…</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
