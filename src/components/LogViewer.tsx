import { useState } from 'react'
import { Columns2, FileCode2, Table2 } from 'lucide-react'
import { FrameTable } from './FrameTable'
import type { CanFrame } from '../lib/types'

export type LogViewMode = 'readable' | 'raw' | 'split'

interface Props {
  frames: CanFrame[]
  fileName: string
  rawText: string
}

export function LogViewer({ frames, fileName, rawText }: Props) {
  const [mode, setMode] = useState<LogViewMode>('readable')

  return (
    <div className="log-viewer">
      <div className="tab-bar" role="tablist" aria-label="Log view mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'readable'}
          className={`tab${mode === 'readable' ? ' is-active' : ''}`}
          onClick={() => setMode('readable')}
        >
          <Table2 size={16} aria-hidden />
          Readable
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'raw'}
          className={`tab${mode === 'raw' ? ' is-active' : ''}`}
          onClick={() => setMode('raw')}
        >
          <FileCode2 size={16} aria-hidden />
          Raw ASC
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'split'}
          className={`tab${mode === 'split' ? ' is-active' : ''}`}
          onClick={() => setMode('split')}
        >
          <Columns2 size={16} aria-hidden />
          Split view
        </button>
      </div>

      {mode === 'readable' && <FrameTable frames={frames} fileName={fileName} />}

      {mode === 'raw' && (
        <RawPanel rawText={rawText} fileName={fileName} emptyHint="Import an ASC log to see raw text." />
      )}

      {mode === 'split' && (
        <div className="split-view">
          <div className="split-view__pane">
            <h3 className="split-view__label">
              <FileCode2 size={14} aria-hidden /> Raw ASC
            </h3>
            <RawPanel
              rawText={rawText}
              fileName={fileName}
              compact
              emptyHint="No raw text yet."
            />
          </div>
          <div className="split-view__pane">
            <h3 className="split-view__label">
              <Table2 size={14} aria-hidden /> Readable
            </h3>
            <FrameTable frames={frames} fileName={fileName} />
          </div>
        </div>
      )}
    </div>
  )
}

function RawPanel({
  rawText,
  fileName,
  emptyHint,
  compact = false,
}: {
  rawText: string
  fileName: string
  emptyHint: string
  compact?: boolean
}) {
  if (!rawText.trim()) {
    return (
      <div className="panel">
        <p className="empty">{emptyHint}</p>
      </div>
    )
  }

  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  return (
    <div className={`panel raw-panel${compact ? ' raw-panel--compact' : ''}`}>
      <p className="muted" style={{ marginBottom: '0.65rem' }}>
        {fileName} · {lines.length.toLocaleString()} lines
      </p>
      <pre className="raw-pre" tabIndex={0}>
        <code>
          {lines.map((line, i) => (
            <span key={i} className="raw-line">
              <span className="raw-line__no" aria-hidden>
                {i + 1}
              </span>
              <span className="raw-line__text">{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
