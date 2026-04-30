import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Roboto supports Cyrillic
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxIIzIXKMny.ttf', fontWeight: 400, fontStyle: 'italic' },
  ],
})

const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
    paddingVertical: 48,
    paddingHorizontal: 52,
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 16,
  },
  appName: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    fontSize: 8,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
  },
  body: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.7,
  },
  italic: {
    fontStyle: 'italic',
    color: '#475569',
  },
  specialistBox: {
    backgroundColor: '#fefce8',
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  topicNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fde68a',
    fontSize: 9,
    fontWeight: 700,
    color: '#92400e',
    textAlign: 'center',
    paddingTop: 3,
  },
  topicText: {
    flex: 1,
    fontSize: 11,
    color: '#78350f',
    lineHeight: 1.6,
  },
  supportBox: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  supportText: {
    fontSize: 11,
    color: '#ffffff',
    lineHeight: 1.7,
    fontWeight: 400,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
})

interface ReportProps {
  reflection: string
  patterns: string
  hypothesis: string
  forSpecialist: string[]
  support: string
  date: string
}

export default function ReportDocument({
  reflection,
  patterns,
  hypothesis,
  forSpecialist,
  support,
  date,
}: ReportProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.appName}>Metanoia AI</Text>
          <Text style={s.title}>Моё состояние — подготовка к приёму</Text>
          <Text style={s.date}>{date}</Text>
        </View>

        {/* Reflection */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.badge}>01</Text>
            <Text style={s.sectionTitle}>Отражение</Text>
          </View>
          <Text style={s.body}>{reflection}</Text>
        </View>

        <View style={s.divider} />

        {/* Patterns */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.badge}>02</Text>
            <Text style={s.sectionTitle}>Паттерны</Text>
          </View>
          <Text style={s.body}>{patterns}</Text>
        </View>

        <View style={s.divider} />

        {/* Hypothesis */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.badge}>03</Text>
            <Text style={s.sectionTitle}>Гипотеза</Text>
          </View>
          <Text style={[s.body, s.italic]}>{hypothesis}</Text>
        </View>

        <View style={s.divider} />

        {/* For Specialist */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.badge}>04</Text>
            <Text style={s.sectionTitle}>Темы для обсуждения со специалистом</Text>
          </View>
          <View style={s.specialistBox}>
            {forSpecialist.map((topic, i) => (
              <View key={i} style={s.topicRow}>
                <Text style={s.topicNumber}>{i + 1}</Text>
                <Text style={s.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Support */}
        <View style={s.supportBox}>
          <Text style={s.supportText}>{support}</Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Составлено AI-ассистентом Metanoia AI. Не является медицинским заключением и не заменяет консультацию специалиста.
          </Text>
        </View>

      </Page>
    </Document>
  )
}
