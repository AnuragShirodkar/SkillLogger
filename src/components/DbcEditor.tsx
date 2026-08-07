import { useEffect, useState } from 'react'
import { Download, Plus, Trash2, Save } from 'lucide-react'
import {
  buildDbc,
  createMessage,
  createSignal,
  saveMessages,
} from '../lib/dbcBuilder'
import { downloadText } from '../lib/ascParser'
import type { ByteOrder, DbcMessage, DbcSignal, SignType } from '../lib/types'

interface DbcEditorProps {
  messages: DbcMessage[]
  onChange: (messages: DbcMessage[]) => void
}

function parseCanId(input: string): number {
  const t = input.trim().toLowerCase().replace(/^0x/, '')
  const n = parseInt(t, 16)
  return Number.isFinite(n) ? n : 0
}

export function DbcEditor({ messages, onChange }: DbcEditorProps) {
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(messages[0]?.id ?? null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!selectedMsgId && messages[0]) {
      setSelectedMsgId(messages[0].id)
    } else if (selectedMsgId && !messages.some((m) => m.id === selectedMsgId)) {
      setSelectedMsgId(messages[0]?.id ?? null)
    }
  }, [messages, selectedMsgId])

  const selected = messages.find((m) => m.id === selectedMsgId) ?? null

  const persist = () => {
    saveMessages(messages)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1500)
  }

  const addMessage = () => {
    const msg = createMessage({
      name: `Msg_${messages.length + 1}`,
      canId: 0x100 + messages.length,
      signals: [createSignal({ name: 'Sig1', startBit: 0, length: 8 })],
    })
    onChange([...messages, msg])
    setSelectedMsgId(msg.id)
  }

  const removeMessage = (id: string) => {
    onChange(messages.filter((m) => m.id !== id))
  }

  const patchMessage = (id: string, patch: Partial<DbcMessage>) => {
    onChange(messages.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  const addSignal = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    const sig = createSignal({
      name: `Sig_${msg.signals.length + 1}`,
      startBit: msg.signals.length * 8,
    })
    patchMessage(msgId, { signals: [...msg.signals, sig] })
  }

  const removeSignal = (msgId: string, sigId: string) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    patchMessage(msgId, { signals: msg.signals.filter((s) => s.id !== sigId) })
  }

  const patchSignal = (msgId: string, sigId: string, patch: Partial<DbcSignal>) => {
    const msg = messages.find((m) => m.id === msgId)
    if (!msg) return
    patchMessage(msgId, {
      signals: msg.signals.map((s) => (s.id === sigId ? { ...s, ...patch } : s)),
    })
  }

  return (
    <div className="dbc-layout">
      <aside className="dbc-sidebar">
        <div className="panel__toolbar">
          <strong>Messages</strong>
          <button type="button" className="btn btn--primary" onClick={addMessage}>
            <Plus size={14} aria-hidden />
            Add
          </button>
        </div>
        <ul className="msg-list">
          {messages.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`msg-list__item${m.id === selectedMsgId ? ' is-active' : ''}`}
                onClick={() => setSelectedMsgId(m.id)}
              >
                <span>{m.name}</span>
                <span className="mono muted">0x{m.canId.toString(16).toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
        {messages.length === 0 && <p className="muted">No messages yet.</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button type="button" className="btn btn--secondary" onClick={persist}>
            <Save size={14} aria-hidden />
            {savedFlash ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => downloadText('skilllogger.dbc', buildDbc(messages))}
            disabled={!messages.length}
          >
            <Download size={14} aria-hidden />
            .dbc
          </button>
        </div>
      </aside>

      <div className="dbc-main">
        {!selected ? (
          <p className="empty">Select or create a message.</p>
        ) : (
          <>
            <div className="panel__toolbar">
              <strong>Message</strong>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => removeMessage(selected.id)}
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            </div>
            <div className="form-grid">
              <label className="field">
                Name
                <input
                  value={selected.name}
                  onChange={(e) => patchMessage(selected.id, { name: e.target.value })}
                />
              </label>
              <label className="field">
                CAN ID (hex)
                <input
                  className="mono"
                  value={selected.canId.toString(16).toUpperCase()}
                  onChange={(e) =>
                    patchMessage(selected.id, { canId: parseCanId(e.target.value) })
                  }
                  spellCheck={false}
                />
              </label>
              <label className="field">
                DLC
                <input
                  type="number"
                  min={0}
                  max={64}
                  value={selected.dlc}
                  onChange={(e) =>
                    patchMessage(selected.id, { dlc: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="field field--check">
                <input
                  type="checkbox"
                  checked={selected.isExtended}
                  onChange={(e) =>
                    patchMessage(selected.id, { isExtended: e.target.checked })
                  }
                />
                Extended ID
              </label>
            </div>

            <div className="panel__toolbar">
              <strong>Signals</strong>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => addSignal(selected.id)}
              >
                <Plus size={14} aria-hidden />
                Add signal
              </button>
            </div>

            <div className="table-wrap">
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start</th>
                    <th>Len</th>
                    <th>Order</th>
                    <th>Sign</th>
                    <th>Factor</th>
                    <th>Offset</th>
                    <th>Unit</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {selected.signals.map((sig) => (
                    <tr key={sig.id}>
                      <td>
                        <input
                          value={sig.name}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, { name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={sig.startBit}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              startBit: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={sig.length}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              length: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={sig.byteOrder}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              byteOrder: e.target.value as ByteOrder,
                            })
                          }
                        >
                          <option value="intel">Intel</option>
                          <option value="motorola">Motorola</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={sig.sign}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              sign: e.target.value as SignType,
                            })
                          }
                        >
                          <option value="unsigned">Unsigned</option>
                          <option value="signed">Signed</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={sig.factor}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              factor: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={sig.offset}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              offset: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={sig.unit}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, { unit: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={sig.minimum}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              minimum: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={sig.maximum}
                          onChange={(e) =>
                            patchSignal(selected.id, sig.id, {
                              maximum: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--icon"
                          title="Remove signal"
                          onClick={() => removeSignal(selected.id, sig.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selected.signals.length === 0 && (
                    <tr>
                      <td colSpan={11} className="empty">
                        No signals on this message.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
