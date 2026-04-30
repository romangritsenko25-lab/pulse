import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import ReportDocument from '@/components/pdf/ReportDocument'
import type { DocumentProps } from '@react-pdf/renderer'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    reflection = '',
    patterns = '',
    hypothesis = '',
    forSpecialist = [],
    support = '',
  } = body

  const date = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  try {
    const element = React.createElement(ReportDocument, {
      reflection,
      patterns,
      hypothesis,
      forSpecialist,
      support,
      date,
    }) as React.ReactElement<DocumentProps>

    const buffer = await renderToBuffer(element)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="metanoia-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF render error:', err)
    return NextResponse.json({ error: 'pdf_failed' }, { status: 500 })
  }
}
