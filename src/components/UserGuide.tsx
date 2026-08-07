import { useState } from 'react'
import {
  BookOpen,
  ChartLine,
  ChevronDown,
  Database,
  FileSpreadsheet,
  Lightbulb,
  Upload,
} from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: '1. Import an ASC log',
    body: 'Use Import to drop a Vector / CANalyzer .asc file, or click Load sample log to try the built-in demo without your own file.',
  },
  {
    icon: FileSpreadsheet,
    title: '2. Compare raw and readable views',
    body: 'Open Frames and switch tabs: Readable shows a clean table, Raw ASC shows the original text, Split view shows both side by side.',
  },
  {
    icon: Database,
    title: '3. Define messages and signals',
    body: 'In Decode and DBC, add a message (name + CAN ID), then signals (start bit, length, factor, offset, unit). Save keeps definitions in this browser. Download .dbc exports a standard DBC file.',
  },
  {
    icon: ChartLine,
    title: '4. Chart decoded values',
    body: 'Charts plot physical signal values over time for IDs that match your definitions, plus a message ID overview. Export PNG to save the chart.',
  },
] as const

export function UserGuide() {
  const [open, setOpen] = useState(true)

  return (
    <div className="guide panel">
      <button
        type="button"
        className="guide__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="guide__title">
          <BookOpen size={20} aria-hidden />
          New here? Quick user guide
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`guide__chevron${open ? ' is-open' : ''}`}
        />
      </button>

      {open && (
        <div className="guide__body">
          <p className="guide__intro">
            SkillLogger runs entirely in your browser. Nothing is uploaded to a server. Follow these
            steps the first time you open the app.
          </p>

          <ol className="guide__steps">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="guide__step">
                  <span className="guide__icon" aria-hidden>
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="guide__tips">
            <p className="guide__tips-title">
              <Lightbulb size={16} aria-hidden /> Tips
            </p>
            <ul>
              <li>
                Default demo definitions decode sample IDs <span className="mono">0x100</span> and{' '}
                <span className="mono">0x200</span>.
              </li>
              <li>CAN ID in the DBC editor is entered in hex (for example <span className="mono">100</span>).</li>
              <li>Intel byte order is little-endian bit numbering; choose Motorola when your DBC uses MSB first.</li>
              <li>Large logs: the readable table shows up to 2,000 rows — use Export CSV for everything.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
