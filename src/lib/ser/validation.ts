const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|all|above)\s+(instructions|prompts)/i,
  /disregard\s+(previous|prior|all|above)/i,
  /forget\s+(everything|all|previous)/i,
  /(show|reveal|tell|give|print|output)\s+(me\s+)?(the\s+)?(system|initial|original)\s+(prompt|instructions)/i,
  /what\s+(are|were)\s+your\s+(initial|original|system)\s+(instructions|prompts)/i,
  /DAN\s+(mode|prompt)/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /you\s+are\s+(now|actually|really)\s+(claude|gpt|chatgpt|gemini)/i,
  /pretend\s+(you|to\s+be)/i,
  /act\s+as\s+(if|though)/i,
  /<\/?system>/i,
  /\[\[.*\]\]/i,
  /(api\s+key|password|secret|token)/i,
  /unlimited\s+(questions|queries)/i,
  /bypass\s+(rate\s+limit|quota|limit)/i,
]

export function detectInjectionAttempt(message: string): {
  detected: boolean
  matchedPatterns: string[]
} {
  if (!message) return { detected: false, matchedPatterns: [] }
  const matched: string[] = []
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) matched.push(pattern.toString())
  }
  const specialCharsRatio = (message.match(/[<>{}|`~]/g) || []).length / message.length
  if (specialCharsRatio > 0.1) matched.push('excessive_special_chars')
  return { detected: matched.length > 0, matchedPatterns: matched }
}

export function validateInput(message: string): { valid: boolean; reason?: string } {
  if (!message || message.trim().length === 0) return { valid: false, reason: 'Mensaje vacío' }
  if (message.length > 2000) return { valid: false, reason: 'Mensaje muy largo (máximo 2000 caracteres)' }
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) return { valid: false, reason: 'Caracteres inválidos detectados' }
  if (/(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)\s/i.test(message)) return { valid: false, reason: 'Contenido sospechoso' }
  return { valid: true }
}
