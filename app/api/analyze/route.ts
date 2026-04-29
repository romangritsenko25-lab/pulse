import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT =
  'Ты AI-ассистент здоровья Pulse. Анализируй данные ' +
  'дневника самочувствия. Отвечай ТОЛЬКО на русском языке. ' +
  'Находи паттерны между сном, энергией и настроением. ' +
  'Называй конкретные цифры из данных. Никогда не ставь ' +
  'диагноз и не заменяй врача. Пиши 3-4 предложения, ' +
  'тепло и конкретно. Заканчивай мотивирующей фразой.'

interface CheckinRow {
  wellbeing: number
  sleep: string
  energy: string
  created_at: string
}

function buildHistoryText(rows: CheckinRow[]): string {
  if (rows.length === 0) return 'Предыдущих записей нет — это первый чекин.'
  return rows
    .map((r) => {
      const date = new Date(r.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
      return `${date}: самочувствие ${r.wellbeing}/10, сон «${r.sleep}», энергия «${r.energy}»`
    })
    .join('\n')
}

export async function POST(req: NextRequest) {
  const { wellbeing, sleep, energy, mood, notes } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let checkinId = crypto.randomUUID()
  let historyText = 'Предыдущих записей нет — это первый чекин.'

  if (user) {
    // 1. Save current checkin
    const { data: saved, error: insertErr } = await supabase
      .from('checkins')
      .insert({ user_id: user.id, wellbeing, sleep, energy, mood: mood || null, notes: notes || null })
      .select('id')
      .single()

    if (!insertErr && saved?.id) checkinId = saved.id

    // 2. Fetch last 7 entries for context (excluding the one just inserted)
    const { data: history } = await supabase
      .from('checkins')
      .select('wellbeing, sleep, energy, created_at')
      .eq('user_id', user.id)
      .neq('id', checkinId)
      .order('created_at', { ascending: false })
      .limit(6)

    historyText = buildHistoryText((history ?? []) as CheckinRow[])
  }

  // 3. Call Claude claude-sonnet-4-6
  let insight = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Сегодняшний чекин:
- Самочувствие: ${wellbeing}/10
- Сон: ${sleep}
- Энергия: ${energy}
- Настроение: ${mood || 'не указано'}
- Заметки: ${notes || 'нет'}

История последних дней:
${historyText}

Дай персональный инсайт.`,
        },
      ],
    })

    insight =
      message.content[0].type === 'text' ? message.content[0].text : ''
  } catch {
    // Fallback without AI
    const levelWord = wellbeing >= 7 ? 'хорошим' : wellbeing >= 5 ? 'умеренным' : 'сложным'
    insight = `Сегодня ваше самочувствие ${wellbeing}/10 — ${levelWord} день. Сон «${sleep}» и энергия «${energy}» дают ясную картину вашего состояния. Продолжайте фиксировать данные — уже через несколько дней появятся заметные паттерны. Вы молодец, что заботитесь о себе!`
  }

  // 4. Persist insight
  if (user) {
    await supabase
      .from('checkins')
      .update({ ai_insight: insight })
      .eq('id', checkinId)
  }

  return NextResponse.json({ insight, id: checkinId, wellbeing, sleep, energy, mood })
}
