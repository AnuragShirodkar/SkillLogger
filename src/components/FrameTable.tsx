import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { downloadText, framesToCsv } from '../lib/ascParser'
import type { CanFrame } from '../lib/types'

interface FrameTableProps {
  frames: CanFrame[]
  fileName?: string
}

export function FrameTable({ frames, fileName = 'frames' }: FrameTableProps) {
  const [idFilter, setIdFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [textFilter, setTextFilter] = useState('')

  const filtered = useMemo(() => {
    const idQ = idFilter.trim().toLowerCase().replace(/^0x/, '')
    const chQ = channelFilter.trim()
    const textQ = textFilter.trim().toLowerCase()
    return frames.filter((f) => {
      if (idQ && !f.idHex.toLowerCase().includes(idQ) && !f.id.toString(16).includes(idQ)) {
        return false
      }
      if (chQ && f.channel.toString() !== chQ) return false
      if (textQ) {
        const hay = `${f.idHex} ${f.direction} ${f.dataHex} ${f.raw}`.toLowerCase()
        if (!hay.includes(textQ)) return false
      }
      return true
    })
  }, [frames, idFilter, channelFilter, textFilter])

  const exportCsv = () => {
    const base = fileName.replace(/\.asc$/i, '') || 'frames'
    downloadText(`${base}_frames.csv`, framesToCsv(filtered), 'text/csv')
  }

  if (frames.length === 0) {
    return (
      <div className="panel">
        <p className="empty">Import an ASC log to inspect frames.</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel__toolbar">
        <div className="filters">
          <label className="field">
            CAN ID
            <input
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              placeholder="e.g. 100"
              spellCheck={false}
            />
          </label>
          <label className="field">
            Channel
            <input
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              placeholder="1"
              inputMode="numeric"
            />
          </label>
          <label className="field field--inline">
            <Search size={14} aria-hidden />
            <input
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Search data, Rx/Tx…"
              spellCheck={false}
            />
          </label>
        </div>
        <button type="button" className="btn btn--secondary" onClick={exportCsv}>
          <Download size={16} aria-hidden />
          Export CSV
        </button>
      </div>

      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        Showing {filtered.length.toLocaleString()} of {frames.length.toLocaleString()} · {fileName}
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Time (s)</th>
              <th>Rel (s)</th>
              <th>Ch</th>
              <th>ID</th>
              <th>Dir</th>
              <th>DLC</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 2000).map((f) => (
              <tr key={f.index}>
                <td className="mono muted">{f.index}</td>
                <td className="mono">{f.timestamp.toFixed(6)}</td>
                <td className="mono">{f.relativeTime.toFixed(6)}</td>
                <td className="mono">{f.channel}</td>
                <td className="mono">
                  0x{f.idHex}
                  {f.isExtended ? ' EXT' : ''}
                </td>
                <td>
                  <span className={`pill pill--${f.direction.toLowerCase()}`}>{f.direction}</span>
                </td>
                <td className="mono">{f.dlc}</td>
                <td className="mono data-cell">{f.isRemote ? 'remote' : f.dataHex || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No frames match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 2000 && (
        <p className="muted" style={{ marginTop: '0.65rem' }}>
          Table capped at 2,000 rows — export CSV for the full filter set.
        </p>
      )}
    </div>
  )
}
