import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import { computeIdRates, decodeSeries } from '../lib/signalDecode'
import type { CanFrame, DbcMessage, DecodedSeries } from '../lib/types'

const COLORS = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4d7c0f', '#0e7490', '#a16207', '#334155']

interface SignalChartProps {
  frames: CanFrame[]
  messages: DbcMessage[]
}

export function SignalChart({ frames, messages }: SignalChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const allSeries = useMemo(() => decodeSeries(frames, messages), [frames, messages])
  const available = useMemo(() => allSeries.filter((s) => s.points.length > 0), [allSeries])
  const availableKey = available.map((s) => s.key).join('|')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected((prev) => {
      const keys = availableKey ? availableKey.split('|') : []
      const keySet = new Set(keys)
      const kept = prev.filter((k) => keySet.has(k))
      if (kept.length) return kept
      return keys.slice(0, 2)
    })
  }, [availableKey])

  const rates = useMemo(() => computeIdRates(frames).slice(0, 12), [frames])

  const chartData = useMemo(() => {
    const active = available.filter((s) => selected.includes(s.key))
    const timeSet = new Set<number>()
    for (const s of active) {
      for (const p of s.points) timeSet.add(p.time)
    }
    const times = [...timeSet].sort((a, b) => a - b)
    return times.map((t) => {
      const row: Record<string, number | null> = { t }
      for (const s of active) {
        const pt = s.points.find((p) => p.time === t)
        row[labelOf(s)] = pt ? pt.value : null
      }
      return row
    })
  }, [available, selected])

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const exportPng = async () => {
    const root = chartRef.current
    if (!root) return
    const svg = root.querySelector('.recharts-wrapper svg') ?? root.querySelector('svg')
    if (!svg) return

    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(svg)
    if (!source.includes('xmlns')) {
      source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    const width = svg.clientWidth || 800
    const height = svg.clientHeight || 360

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('PNG export failed'))
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#f7faf9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)

    const a = document.createElement('a')
    a.download = 'skilllogger_chart.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  if (frames.length === 0) {
    return (
      <div className="panel">
        <p className="empty">Import ASC frames to decode and chart signals.</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="panel">
        <p className="empty">Define messages and signals in the DBC editor to decode.</p>
      </div>
    )
  }

  return (
    <div className="charts">
      <div className="panel">
        <div className="panel__toolbar">
          <strong>Signals to plot</strong>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void exportPng()}
            disabled={selected.length === 0}
          >
            <Download size={16} aria-hidden />
            Export PNG
          </button>
        </div>

        {available.length === 0 ? (
          <p className="muted">No matching frames for defined signals (check CAN IDs).</p>
        ) : (
          <div className="chip-row">
            {available.map((s) => {
              const on = selected.includes(s.key)
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`chip${on ? ' is-active' : ''}`}
                  onClick={() => toggle(s.key)}
                >
                  {labelOf(s)} ({s.points.length})
                </button>
              )
            })}
          </div>
        )}

        <div className="chart-box" ref={chartRef}>
          {selected.length === 0 ? (
            <p className="empty">Select one or more signals above.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#c5d0cc" strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  stroke="#5b6b66"
                />
                <YAxis stroke="#5b6b66" />
                <Tooltip
                  contentStyle={{
                    background: '#f7faf9',
                    border: '1px solid #c5d0cc',
                    borderRadius: 8,
                  }}
                  labelFormatter={(v) => `t = ${Number(v).toFixed(6)} s`}
                />
                <Legend />
                {available
                  .filter((s) => selected.includes(s.key))
                  .map((s, i) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={labelOf(s)}
                      stroke={COLORS[i % COLORS.length]}
                      dot={false}
                      strokeWidth={2}
                      connectNulls
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel">
        <strong>ID rate overview</strong>
        {rates.length === 0 ? (
          <p className="empty">No frames.</p>
        ) : (
          <>
            <div className="chart-box" style={{ marginTop: '0.75rem' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={rates.map((r) => ({
                    id: `0x${r.idHex}`,
                    count: r.count,
                    hz: Number(r.rateHz.toFixed(2)),
                  }))}
                >
                  <CartesianGrid stroke="#c5d0cc" strokeDasharray="3 3" />
                  <XAxis dataKey="id" stroke="#5b6b66" interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis stroke="#5b6b66" />
                  <Tooltip
                    contentStyle={{
                      background: '#f7faf9',
                      border: '1px solid #c5d0cc',
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" name="Frames" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Count</th>
                    <th>Rate (Hz)</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">0x{r.idHex}</td>
                      <td className="mono">{r.count}</td>
                      <td className="mono">{r.rateHz.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function labelOf(s: DecodedSeries): string {
  const unit = s.unit ? ` [${s.unit}]` : ''
  return `${s.messageName}.${s.signalName}${unit}`
}
