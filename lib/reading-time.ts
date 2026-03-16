const WORDS_PER_MINUTE = 200
const CODE_CHARS_PER_MINUTE = 100

export function calculateReadingTime(content: string): number {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '')

  const codeBlocks: string[] = []
  const prose = withoutFrontmatter.replace(
    /```[\s\S]*?```/g,
    (match) => { codeBlocks.push(match); return '' }
  )

  const proseWords = prose
    .replace(/<[^>]+>/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/[#*_~`>[\]()!|-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .length

  const codeChars = codeBlocks.join('').length

  const proseMinutes = proseWords / WORDS_PER_MINUTE
  const codeMinutes = codeChars / CODE_CHARS_PER_MINUTE

  return Math.max(1, Math.ceil(proseMinutes + codeMinutes))
}
