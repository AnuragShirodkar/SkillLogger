import type { AscHeader, AscParseResult, CanDirection, CanFrame } from './types'

const DATA_LINE =
  /^\s*(\d+(?:\.\d+)?)\s+(\d+)\s+([0-9A-Fa-f]+)(x)?\s+(Rx|Tx)\s+([dr])\s+([0-9A-Fa-f]+)((?:\s+[0-9A-Fa-f]{1,2})*)/i

function parseIntBase(value: string, base: 'hex' | 'dec'): number {
  return parseInt(value, base === 'hex' ? 16 : 10)
}

function formatIdHex(id: number, extended: boolean): string {
  const width = extended || id > 0x7ff ? 8 : 3
  return id.toString(16).toUpperCase().padStart(width, '0')
}

export function parseAsc(text: string, fileName = 'log.asc'): AscParseResult {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const header: AscHeader = {
    base: 'hex',
    timestamps: 'absolute',
    internalEvents: false,
  }

  const frames: CanFrame[] = []
  let otherLines = 0
  let t0: number | null = null
  let index = 0

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const lower = line.toLowerCase()
    if (lower.startsWith('date ')) {
      header.date = line.slice(5).trim()
      continue
    }
    if (lower.startsWith('base ')) {
      header.base = /\bdec\b/i.test(line) ? 'dec' : 'hex'
      header.timestamps = /\brelative\b/i.test(line) ? 'relative' : 'absolute'
      continue
    }
    if (lower.includes('internal events')) {
      header.internalEvents = !lower.startsWith('no ')
      continue
    }
    if (lower.startsWith('// version')) {
      header.version = line.replace(/^\/\/\s*version\s*/i, '').trim()
      continue
    }
    if (
      lower.startsWith('begin ') ||
      lower.startsWith('end ') ||
      lower.startsWith('//') ||
      lower.includes('statistic:') ||
      lower.includes('errorframe') ||
      lower.includes('status:') ||
      lower.startsWith('canfd ')
    ) {
      otherLines += 1
      continue
    }

    const m = DATA_LINE.exec(line)
    if (!m) {
      otherLines += 1
      continue
    }

    const timestamp = parseFloat(m[1])
    if (t0 === null) t0 = timestamp
    const channel = parseInt(m[2], 10)
    const idToken = m[3]
    const extFlag = Boolean(m[4])
    const direction = m[5] as CanDirection
    const isRemote = m[6].toLowerCase() === 'r'
    const dlc = parseIntBase(m[7], header.base)
    const dataTokens = (m[8] ?? '').trim().split(/\s+/).filter(Boolean)
    const data = dataTokens
      .slice(0, dlc)
      .map((b) => parseIntBase(b, header.base))
      .filter((n) => !Number.isNaN(n))

    const id = parseIntBase(idToken, header.base)
    const isExtended = extFlag || id > 0x7ff

    frames.push({
      index: index++,
      timestamp,
      relativeTime: timestamp - (t0 ?? timestamp),
      channel,
      id,
      idHex: formatIdHex(id, isExtended),
      isExtended,
      direction,
      isRemote,
      dlc,
      data,
      dataHex: data.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
      raw: line,
      kind: 'data',
    })
  }

  return { header, frames, otherLines, fileName }
}

export function framesToCsv(frames: CanFrame[]): string {
  const header = [
    'index',
    'timestamp',
    'relative_s',
    'channel',
    'id_hex',
    'extended',
    'direction',
    'remote',
    'dlc',
    'data',
  ]
  const rows = frames.map((f) =>
    [
      f.index,
      f.timestamp.toFixed(6),
      f.relativeTime.toFixed(6),
      f.channel,
      f.idHex,
      f.isExtended ? 1 : 0,
      f.direction,
      f.isRemote ? 1 : 0,
      f.dlc,
      `"${f.dataHex}"`,
    ].join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
