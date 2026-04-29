'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'

interface CheckinEntry {
  id: string
  mood: number
  energy: number
  sleep: number
  stress: number
  score: number
  created_at: string
}

const MOCK_DATA: CheckinEntry[] = [
  { id: '1', mood: 3, energy: 3, sleep: 6, stress: 4, score: 45, created_at: '2024-04-22' },
  { id: '2', mood: 4, energy: 4, sleep: 8, stress: 2, score: 72, created_at: '2024-04-23' },
  { id: '3', mood: 2, energy: 2, sleep: 5, stress: 5, score: 30, created_at: '2024-04-24' },
  { id: '4', mood: 4, energy: 5, sleep: 9, stress: 2, score: 82, created_at: '2024-04-25' },
  { id: '5', mood: 5, energy: 4, sleep: 8, stress: 1, score: 88, created_at: '2024-04-26' },
  { id: '6', mood: 3, energy: 3, sleep: 7, stress: 3, score: 58, created_at: '2024-04-27' },
  { id: '7', mood: 4, energy: 4, sleep: 8, stress: 2, score: 74, created_at: '2024-04-28' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [data] = useState<CheckinEntry[]>(MOCK_DATA)

  const avgScore = Math.round(data.reduce((a, b) => a + b.score, 0) / data.length)
  const avgMood = (data.reduce((a, b) => a + b.mood, 0) / data.length).toFixed(1)
  const avgSleep = (data.reduce((a, b) => a + b.sleep, 0) / data.length).toFixed(1)
  const avgStress = (data.reduce((a, b) => a + b.stress, 0) / data.length).toFixed(1)

  const radarData = [
    { subject: 'Настроение', value: (Number(avgMood) / 5) * 100 },
    { subject: 'Энергия', value: (data.reduce((a, b) => a + b.energy, 0) / data.length / 5) * 100 },
    { subject: 'Сон', value: (Number(avgSleep) / 12) * 100 },
    { subject: 'Стресс', value: (1 - Number(avgStress) / 5) * 100 },
  ]

  const chartData = data.map((d) => ({
    date: new Date(d.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    score: d.score,
    mood: d.mood * 20,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Дашборд</h1>
            <p className="text-violet-400 text-sm">Последние 7 дней</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/upgrade')}
              className="text-sm text-amber-400 hover:text-amber-300 transition border border-amber-500/30 px-3 py-1.5 rounded-lg"
            >
              ⭐ Pro
            </button>
            <button
              onClick={() => router.push('/checkin')}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-1.5 rounded-lg transition"
            >
              + Чекин
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Индекс', value: avgScore, suffix: '' },
            { label: 'Настроение', value: avgMood, suffix: '/5' },
            { label: 'Сон', value: avgSleep, suffix: 'ч' },
            { label: 'Стресс', value: avgStress, suffix: '/5' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {s.value}
                <span className="text-sm text-violet-400">{s.suffix}</span>
              </div>
              <div className="text-xs text-violet-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-medium text-violet-300 mb-4">Динамика самочувствия</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#a78bfa" tick={{ fontSize: 11 }} />
              <YAxis stroke="#a78bfa" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(30,0,60,0.9)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Индекс"
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 4 }}
                name="Настроение"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-medium text-violet-300 mb-4">Профиль самочувствия</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a78bfa', fontSize: 12 }} />
              <Radar
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-violet-300 mb-4">История чекинов</h2>
          <div className="space-y-2">
            {[...data].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-violet-400 text-sm">
                  {new Date(entry.created_at).toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-violet-500">
                    😴 {entry.sleep}ч · 😤 {entry.stress}/5
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      entry.score >= 70
                        ? 'text-green-400'
                        : entry.score >= 40
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {entry.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
