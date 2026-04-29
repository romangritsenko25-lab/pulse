'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  wellbeing: number
  sleep: string
  energy: string
  mood: string
  notes: string
}

// ── Constants ──────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5

const SLEEP_OPTIONS = [
  { value: 'Мало (1–5 ч)', emoji: '😴', desc: 'Не выспался' },
  { value: 'Норма (6–7 ч)', emoji: '🌙', desc: 'Неплохо' },
  { value: 'Хорошо (8+ ч)', emoji: '✨', desc: 'Отлично' },
]

const ENERGY_OPTIONS = [
  { value: 'Низкая', emoji: '🔋', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { value: 'Средняя', emoji: '⚡', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300' },
  { value: 'Высокая', emoji: '🚀', color: 'border-green-500/50 bg-green-500/10 text-green-300' },
]

const MOOD_SUGGESTIONS = ['Спокойное', 'Тревожное', 'Радостное', 'Усталое', 'Вдохновлённое', 'Грустное']

// ── Helpers ────────────────────────────────────────────────────────────────
function wellbeingMeta(v: number): { label: string; color: string; emoji: string } {
  if (v <= 2) return { label: 'Очень плохо', color: 'text-red-400', emoji: '😔' }
  if (v <= 4) return { label: 'Плохо', color: 'text-orange-400', emoji: '😕' }
  if (v <= 6) return { label: 'Нормально', color: 'text-yellow-400', emoji: '😐' }
  if (v <= 8) return { label: 'Хорошо', color: 'text-green-400', emoji: '🙂' }
  return { label: 'Отлично', color: 'text-emerald-400', emoji: '😄' }
}

// ── Step components ────────────────────────────────────────────────────────
function StepWellbeing({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const meta = wellbeingMeta(value)
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-7xl select-none">{meta.emoji}</div>
      <div className="text-center">
        <span className={`text-6xl font-bold ${meta.color}`}>{value}</span>
        <span className="text-violet-500 text-2xl">/10</span>
        <p className={`text-lg font-medium mt-1 ${meta.color}`}>{meta.label}</p>
      </div>
      <div className="w-full px-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 accent-violet-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-violet-600 mt-2">
          <span>1 — плохо</span>
          <span>10 — отлично</span>
        </div>
      </div>
    </div>
  )
}

function StepSleep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {SLEEP_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-4 p-4 rounded-2xl border transition text-left ${
            value === opt.value
              ? 'border-violet-500 bg-violet-600/20'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <span className="text-3xl">{opt.emoji}</span>
          <div>
            <div className="text-white font-medium">{opt.value}</div>
            <div className="text-violet-400 text-sm">{opt.desc}</div>
          </div>
          {value === opt.value && (
            <span className="ml-auto text-violet-400">✓</span>
          )}
        </button>
      ))}
    </div>
  )
}

function StepEnergy({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {ENERGY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
            value === opt.value ? opt.color : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <span className="text-3xl">{opt.emoji}</span>
          <div className="text-white font-semibold text-lg">{opt.value}</div>
          {value === opt.value && <span className="ml-auto">✓</span>}
        </button>
      ))}
    </div>
  )
}

function StepMood({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Опишите своё настроение…"
        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
      />
      <div>
        <p className="text-violet-400 text-sm mb-3">Быстрый выбор:</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_SUGGESTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={`px-4 py-2 rounded-xl text-sm border transition ${
                value === m
                  ? 'border-violet-500 bg-violet-600/30 text-white'
                  : 'border-white/15 bg-white/5 text-violet-300 hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepNotes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Что сегодня произошло? Что беспокоит или радует? Можно пропустить."
        rows={5}
        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition"
      />
      <p className="text-violet-500 text-xs text-right">{value.length} / 500</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
const STEP_META = [
  { title: 'Самочувствие', subtitle: 'Как вы себя чувствуете сегодня?' },
  { title: 'Сон', subtitle: 'Как прошла ваша ночь?' },
  { title: 'Энергия', subtitle: 'Какой у вас уровень энергии?' },
  { title: 'Настроение', subtitle: 'Что вы сейчас ощущаете?' },
  { title: 'Заметки', subtitle: 'Хотите что-то добавить?' },
]

export default function CheckinPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    wellbeing: 5,
    sleep: 'Норма (6–7 ч)',
    energy: 'Средняя',
    mood: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function canGoNext(): boolean {
    if (step === 4 && form.mood.trim() === '') return false
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()

      // 1. Verify active session
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      // 2. INSERT checkin into Supabase
      const { data: checkin, error: insertError } = await supabase
        .from('checkins')
        .insert({
          user_id: user.id,
          wellbeing: form.wellbeing,
          sleep: form.sleep,
          energy: form.energy,
          mood: form.mood || null,
          notes: form.notes || null,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Checkin insert error:', insertError)
        setError(`Не удалось сохранить данные: ${insertError.message}`)
        setLoading(false)
        return
      }

      // 3. Get AI analysis (passes checkin_id so route skips duplicate insert)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, checkin_id: checkin.id }),
      })
      if (!res.ok) throw new Error('server_error')
      const data = await res.json()
      sessionStorage.setItem(`pulse_checkin_${data.id}`, JSON.stringify(data))
      router.push(`/result?id=${data.id}`)
    } catch (err) {
      console.error('handleSubmit error:', err)
      setError('Не удалось получить анализ. Проверьте соединение и попробуйте снова.')
      setLoading(false)
    }
  }

  const meta = STEP_META[step - 1]
  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-violet-400 text-sm font-medium">
            Шаг {step} из {TOTAL_STEPS}
          </span>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-violet-500 hover:text-violet-300 text-sm transition"
          >
            Дашборд →
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        {/* Step header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">{meta.title}</h2>
          <p className="text-violet-400 mt-1">{meta.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="flex-1">
          {step === 1 && (
            <StepWellbeing value={form.wellbeing} onChange={(v) => set('wellbeing', v)} />
          )}
          {step === 2 && (
            <StepSleep value={form.sleep} onChange={(v) => set('sleep', v)} />
          )}
          {step === 3 && (
            <StepEnergy value={form.energy} onChange={(v) => set('energy', v)} />
          )}
          {step === 4 && (
            <StepMood value={form.mood} onChange={(v) => set('mood', v)} />
          )}
          {step === 5 && (
            <StepNotes value={form.notes} onChange={(v) => set('notes', v)} />
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-white hover:bg-white/10 transition font-medium"
            >
              ← Назад
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canGoNext()}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition"
            >
              Далее →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>
                  Claude анализирует…
                </>
              ) : (
                '✨ Получить AI-инсайт'
              )}
            </button>
          )}
        </div>

        {/* Skip notes on step 5 */}
        {step === 5 && !loading && (
          <button
            type="button"
            onClick={() => { set('notes', ''); handleSubmit() }}
            className="mt-3 text-violet-500 hover:text-violet-300 text-sm text-center w-full transition"
          >
            Пропустить заметки
          </button>
        )}
      </div>
    </div>
  )
}
