export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function isNewArticle(publishedAt: Date | null): boolean {
  if (!publishedAt) return false
  const sevenDays = new Date()
  sevenDays.setDate(sevenDays.getDate() - 7)
  return publishedAt > sevenDays
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return 'ahora mismo'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffH < 24) return `hace ${diffH}h`
  if (diffD < 7) return `hace ${diffD} día${diffD !== 1 ? 's' : ''}`
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFullDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Simple markdown → HTML renderer (no external deps)
function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="mente-inline-code">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="mente-img" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="mente-link" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function renderMarkdown(md: string): string {
  if (!md) return ''
  const lines = md.split('\n')
  let html = ''
  let inCode = false
  let codeContent = ''
  let listType = ''

  const closeList = () => {
    if (listType) { html += `</${listType}>`; listType = '' }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html += `<pre class="mente-pre"><code>${escHtml(codeContent.trimStart())}</code></pre>`
        codeContent = ''; inCode = false
      } else { closeList(); inCode = true }
      continue
    }
    if (inCode) { codeContent += line + '\n'; continue }

    if (line.startsWith('### ')) { closeList(); html += `<h3 class="mente-h3">${inline(line.slice(4))}</h3>`; continue }
    if (line.startsWith('## '))  { closeList(); html += `<h2 class="mente-h2">${inline(line.slice(3))}</h2>`; continue }
    if (line.startsWith('# '))   { closeList(); html += `<h1 class="mente-h1">${inline(line.slice(2))}</h1>`; continue }
    if (line.trim() === '---')   { closeList(); html += '<hr class="mente-hr" />'; continue }
    if (line.startsWith('> '))   { closeList(); html += `<blockquote class="mente-blockquote">${inline(line.slice(2))}</blockquote>`; continue }

    const ulMatch = line.match(/^[-*] (.+)/)
    if (ulMatch) {
      if (listType !== 'ul') { closeList(); html += '<ul class="mente-ul">'; listType = 'ul' }
      html += `<li>${inline(ulMatch[1])}</li>`; continue
    }
    const olMatch = line.match(/^\d+\. (.+)/)
    if (olMatch) {
      if (listType !== 'ol') { closeList(); html += '<ol class="mente-ol">'; listType = 'ol' }
      html += `<li>${inline(olMatch[1])}</li>`; continue
    }

    if (line.trim() === '') { closeList(); continue }
    closeList()
    html += `<p class="mente-p">${inline(line)}</p>`
  }
  closeList()
  return html
}
