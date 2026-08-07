import { useCallback, useState } from 'react'
import { Activity, Cable, Database, FileSpreadsheet } from 'lucide-react'
import { AscUploader } from './components/AscUploader'
import { DbcEditor } from './components/DbcEditor'
import { FrameTable } from './components/FrameTable'
import { SignalChart } from './components/SignalChart'
import { loadMessages } from './lib/dbcBuilder'
import type { AscParseResult, DbcMessage } from './lib/types'

export default function App() {
  const [asc, setAsc] = useState<AscParseResult | null>(null)
  const [messages, setMessages] = useState<DbcMessage[]>(() => loadMessages())

  const onParsed = useCallback((result: AscParseResult) => {
    setAsc(result)
  }, [])

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__atmosphere" aria-hidden />
        <nav className="topnav">
          <a href="#import" className="topnav__link">
            Import
          </a>
          <a href="#frames" className="topnav__link">
            Frames
          </a>
          <a href="#dbc" className="topnav__link">
            DBC
          </a>
          <a href="#charts" className="topnav__link">
            Charts
          </a>
        </nav>
        <div className="hero__content">
          <p className="brand">
            <Cable size={28} aria-hidden />
            SkillLogger
          </p>
          <h1>Read CAN ASC. Build DBC. See the signals.</h1>
          <p className="hero__lead">
            Drop a Vector / CANalyzer ASCII log, review frames in plain language, define messages
            and signals, export a DBC, and chart decoded values — all in your browser.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#import">
              <FileSpreadsheet size={18} aria-hidden />
              Open ASC file
            </a>
            <a className="btn btn--ghost" href="#dbc">
              <Database size={18} aria-hidden />
              Define DBC
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="import" className="section">
          <div className="section__head">
            <h2>
              <FileSpreadsheet size={20} aria-hidden /> Import
            </h2>
            <p>Upload a Vector ASC log or try the built-in sample.</p>
          </div>
          <AscUploader onParsed={onParsed} result={asc} />
        </section>

        <section id="frames" className="section">
          <div className="section__head">
            <h2>
              <Activity size={20} aria-hidden /> Frames
            </h2>
            <p>Human-readable CAN traffic with filters and CSV export.</p>
          </div>
          <FrameTable frames={asc?.frames ?? []} fileName={asc?.fileName ?? 'frames'} />
        </section>

        <section id="dbc" className="section">
          <div className="section__head">
            <h2>
              <Database size={20} aria-hidden /> Decode and DBC
            </h2>
            <p>
              Name messages and signals (ID, start bit, length, scale, offset, unit), then export
              a .dbc. Definitions are saved in this browser.
            </p>
          </div>
          <DbcEditor messages={messages} onChange={setMessages} />
        </section>

        <section id="charts" className="section">
          <div className="section__head">
            <h2>
              <Activity size={20} aria-hidden /> Charts
            </h2>
            <p>Decoded signal trends and message ID distribution from the loaded log.</p>
          </div>
          <SignalChart frames={asc?.frames ?? []} messages={messages} />
        </section>
      </main>

      <footer className="footer">
        <span>SkillLogger</span>
        <span className="muted">Client-side Vector ASC · DBC · signal charts</span>
      </footer>
    </div>
  )
}
