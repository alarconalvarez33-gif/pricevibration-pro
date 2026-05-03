export const MENTE_TOPICS = [
  { id: 'Forex',              label: 'Forex',              icon: '💱' },
  { id: 'Acciones',          label: 'Acciones',           icon: '📈' },
  { id: 'Cripto',            label: 'Cripto',             icon: '₿'  },
  { id: 'Análisis Técnico',  label: 'Análisis Técnico',   icon: '📊' },
  { id: 'Psicología',        label: 'Psicología',         icon: '🧠' },
  { id: 'Estrategias',       label: 'Estrategias',        icon: '🎯' },
  { id: 'Gestión de Riesgo', label: 'Gestión de Riesgo',  icon: '🛡️' },
  { id: 'Noticias',          label: 'Noticias',           icon: '📰' },
] as const

export type MenteTopic = typeof MENTE_TOPICS[number]['id']

export const TOPIC_TO_COURSE: Record<string, string> = {
  'Forex':              'Génesis',
  'Análisis Técnico':   'Génesis',
  'Estrategias':        'Super Estrategia',
  'Psicología':         'Génesis',
  'Gestión de Riesgo':  'Super Estrategia',
  'Acciones':           'Génesis',
  'Cripto':             'Génesis',
  'Noticias':           'Frecuencia',
}

export const TOPIC_TO_COURSE_HREF: Record<string, string> = {
  'Forex':              '/cursos',
  'Análisis Técnico':   '/cursos',
  'Estrategias':        '/cursos',
  'Psicología':         '/cursos',
  'Gestión de Riesgo':  '/cursos',
  'Acciones':           '/cursos',
  'Cripto':             '/cursos',
  'Noticias':           '/cursos/frecuencia',
}
