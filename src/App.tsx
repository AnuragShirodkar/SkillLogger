import { useCallback, useState } from 'react'
import { Activity, BookOpen, Cable, Database, FileSpreadsheet } from 'lucide-react'
import { AscUploader } from './components/AscUploader'
import { DbcEditor } from './components/DbcEditor'
import { LogViewer } from './components/LogViewer'
import { SignalChart } from './components/SignalChart'
import { UserGuide } from './components/UserGuide'
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
          <a href="#guide" className="topnav__link">
            Guide
          </a>
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
            <a className="btn btn--ghost" href="#guide">
              <BookOpen size={18} aria-hidden />
              New user guide
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="guide" className="section">
          <div className="section__head">
            <h2>
              <BookOpen size={20} aria-hidden /> User guide
            </h2>
            <p>Short walkthrough if you are opening SkillLogger for the first time.</p>
          </div>
          <UserGuide />
        </section>

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
            <p>Switch tabs to view readable frames, raw ASC text, or both side by side.</p>
          </div>
          <LogViewer
            frames={asc?.frames ?? []}
            fileName={asc?.fileName ?? 'frames'}
            rawText={asc?.rawText ?? ''}
          />
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
