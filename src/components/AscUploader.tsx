import { useCallback, useRef, useState } from 'react'
import { FileUp, FolderOpen, Loader2 } from 'lucide-react'
import { parseAsc } from '../lib/ascParser'
import type { AscParseResult } from '../lib/types'

interface Props {
  onParsed: (result: AscParseResult) => void
  result: AscParseResult | null
}

export function AscUploader({ onParsed, result }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return
      setError(null)
      setBusy(true)
      try {
        const text = await file.text()
        const parsed = parseAsc(text, file.name)
        if (!parsed.frames.length) {
          setError('No CAN data frames found. Check that this is a Vector/CANalyzer ASC file.')
        }
        onParsed(parsed)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to read file')
      } finally {
        setBusy(false)
      }
    },
    [onParsed],
  )

  const loadSample = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/samples/demo.asc')
      if (!res.ok) throw new Error('Sample file missing')
      const text = await res.text()
      onParsed(parseAsc(text, 'demo.asc'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load sample')
    } finally {
      setBusy(false)
    }
  }, [onParsed])

  return (
    <div className="uploader">
      <div
        className={`dropzone${dragging ? ' dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFile(e.dataTransfer.files?.[0] ?? null)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".asc,.txt,text/plain"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
        {busy ? <Loader2 className="icon-spin" size={28} aria-hidden /> : <FileUp size={28} aria-hidden />}
        <p className="dropzone__title">Drop a Vector ASC file here</p>
        <p className="dropzone__hint">or click to browse — .asc / .txt</p>
      </div>

      <div className="uploader__actions">
        <button type="button" className="btn btn--ghost" onClick={() => void loadSample()}>
          <FolderOpen size={16} aria-hidden />
          Load sample log
        </button>
      </div>

      {error && <p className="banner banner--error">{error}</p>}

      {result && (
        <div className="stat-row" aria-live="polite">
          <div>
            <span className="stat-label">File</span>
            <strong>{result.fileName}</strong>
          </div>
          <div>
            <span className="stat-label">Frames</span>
            <strong>{result.frames.length}</strong>
          </div>
          <div>
            <span className="stat-label">Base</span>
            <strong>{result.header.base}</strong>
          </div>
          <div>
            <span className="stat-label">Timestamps</span>
            <strong>{result.header.timestamps}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
