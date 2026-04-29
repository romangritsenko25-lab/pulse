'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────
interface CheckinData {
  id: string
  insight: string
  wellbeing: number
  sleep: string
  energy: string
  mood?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────
const SLEEP_EMOJI: Record<string, string> = {
  'Мало (1–5 ч)': '😴',
  'Норма (6–7 ч)': '🌙',
  'Хорошо (8+ ч)': '✨',
}
const ENERGY_EMOJI: Record<string, string> = {
  Низкая: '🔋',
  Средняя: '⚡',
  Высокая: '🚀',
}

function wellbeingColor(v: number): string {
  if (v <= 3) return 'text-red-400'
  if (v <= 5) return 'text-orange-400'
  if (v <= 7) return 'text-yellow-400'
  return 'text-green-400'
}
function wellbeingLabel(v: number): string {
  if (v <= 2) return 'Очень плохо'
  if (v <= 4) return 'Плохо'
  if (v <= 6) return 'Нормально'
  if (v <= 8) return 'Хорошо'
  return 'Отлично'
}

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  sub,
  valueClass = 'text-white',
}: {
  icon: string
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
      <span className="text-3xl">{icon}</span>
      <span className={`text-xl font-bold mt-1 ${valueClass}`}>{value}</span>
      {sub && <span className="text-violet-500 text-xs">{sub}</span>}
      <span className="text-violet-400 text-xs">{label}</span>
    </div>
  )
}

// ── Main content ───────────────────────────────────────────────────────────
function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [data, setData] = useState<CheckinData | null>(null)
  const [reminderState, setReminderState] = useState<'idle' | 'set' | 'unavailable'>('idle')

  useEffect(() => {
    if (!id) { router.replace('/checkin'); return }
    const raw = sessionStorage.getItem(`pulse_checkin_${id}`)
    if (raw) setData(JSON.parse(raw))
    else router.replace('/checkin')
  }, [id, router])

  async function handleReminder() {
    if (!('Notification' in window)) {
      setReminderState('unavailable')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const tomorrow19 = new Date()
      tomorrow19.setDate(tomorrow19.getDate() + 1)
      tomorrow19.setHours(19, 0, 0, 0)
      const delay = tomorrow19.getTime() - Date.now()
      setTimeout(() => {
        new Notification('Pulse — время чекина 💜', {
          body: 'Как вы себя чувствуете сегодня? Запишите своё состояние.',
          icon: '/favicon.ico',
        })
      }, delay)
      setReminderState('set')
    } else {
      setReminderState('unavailable')
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <p className="text-violet-400 animate-pulse text-sm">Загрузка…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-4">
      <div className="max-w-lg mx-auto py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-violet-400 text-sm">
              {new Date().toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Ваш AI-инсайт</h1>
          </div>
          <span className="text-3xl select-none">💜</span>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={wellbeingLabel(data.wellbeing) === 'Отлично' ? '😄' : data.wellbeing >= 7 ? '🙂' : data.wellbeing >= 5 ? '😐' : '😔'}
            label="Самочувствие"
            value={`${data.wellbeing}/10`}
            sub={wellbeingLabel(data.wellbeing)}
            valueClass={wellbeingColor(data.wellbeing)}
          />
          <MetricCard
            icon={SLEEP_EMOJI[data.sleep] ?? '🌙'}
            label="Сон"
            value={data.sleep.replace(/ \(.+\)/, '')}
            valueClass="text-blue-300"
          />
          <MetricCard
            icon={ENERGY_EMOJI[data.energy] ?? '⚡'}
            label="Энергия"
            value={data.energy}
            valueClass="text-yellow-300"
          />
        </div>

        {/* AI Insight block */}
        <div className="bg-blue-600/15 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-base">
              🤖
            </div>
            <span className="text-blue-300 font-medium text-sm">Pulse AI</span>
            <span className="ml-auto text-blue-400/50 text-xs">claude-sonnet-4-6</span>
          </div>
          <p className="text-white/90 leading-relaxed text-[15px]">{data.insight}</p>
        </div>

        {/* Mood tag if present */}
        {data.mood && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-violet-400 text-sm">💭 Настроение:</span>
            <span className="text-white text-sm font-medium">{data.mood}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-1">
          {/* Reminder button */}
          <button
            onClick={handleReminder}
            disabled={reminderState !== 'idle'}
            className={`w-full py-3.5 rounded-2xl font-medium transition flex items-center justify-center gap-2 text-sm ${
              reminderState === 'set'
                ? 'bg-green-600/20 border border-green-500/30 text-green-400 cursor-default'
                : reminderState === 'unavailable'
                ? 'bg-white/5 border border-white/10 text-violet-500 cursor-default'
                : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
            }`}
          >
            {reminderState === 'set' && '✅ Напоминание установлено на 19:00'}
            {reminderState === 'unavailable' && '🔕 Уведомления недоступны в браузере'}
            {reminderState === 'idle' && '🔔 Новый чек-ин завтра в 19:00'}
          </button>

          {/* Dashboard button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 rounded-2xl transition"
          >
            На дашборд →
          </button>

          <button
            onClick={() => router.push('/checkin')}
            className="w-full text-violet-500 hover:text-violet-300 text-sm py-2 transition text-center"
          >
            Ещё один чекин
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <p className="text-violet-400 animate-pulse text-sm">Загрузка…</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
