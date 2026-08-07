import type { CanFrame, DbcMessage, DbcSignal, DecodedSeries } from './types'

function extractRawIntel(data: number[], startBit: number, length: number): number {
  let raw = 0
  for (let i = 0; i < length; i += 1) {
    const bit = startBit + i
    const byteIndex = Math.floor(bit / 8)
    const bitInByte = bit % 8
    if (byteIndex >= data.length) break
    const bitVal = (data[byteIndex] >> bitInByte) & 1
    raw |= bitVal << i
  }
  return raw
}

function extractRawMotorola(data: number[], startBit: number, length: number): number {
  let raw = 0
  let bit = startBit
  for (let i = 0; i < length; i += 1) {
    const byteIndex = Math.floor(bit / 8)
    const bitInByte = bit % 8
    if (byteIndex < data.length) {
      const bitVal = (data[byteIndex] >> bitInByte) & 1
      raw = (raw << 1) | bitVal
    } else {
      raw <<= 1
    }
    if (bitInByte === 0) {
      bit += 15
    } else {
      bit -= 1
    }
  }
  return raw
}

function toSigned(raw: number, length: number): number {
  const signBit = 1 << (length - 1)
  if (raw & signBit) {
    return raw - (1 << length)
  }
  return raw
}

export function decodeSignal(data: number[], signal: DbcSignal): number | null {
  if (signal.length <= 0 || signal.length > 64) return null
  const rawUnsigned =
    signal.byteOrder === 'intel'
      ? extractRawIntel(data, signal.startBit, signal.length)
      : extractRawMotorola(data, signal.startBit, signal.length)

  const raw = signal.sign === 'signed' ? toSigned(rawUnsigned, signal.length) : rawUnsigned
  return raw * signal.factor + signal.offset
}

export function decodeSeries(frames: CanFrame[], messages: DbcMessage[]): DecodedSeries[] {
  const byId = new Map<number, DbcMessage>()
  for (const msg of messages) {
    byId.set(msg.canId, msg)
  }

  const seriesMap = new Map<string, DecodedSeries>()

  for (const frame of frames) {
    if (frame.isRemote) continue
    const msg = byId.get(frame.id)
    if (!msg) continue
    for (const signal of msg.signals) {
      const value = decodeSignal(frame.data, signal)
      if (value === null || Number.isNaN(value)) continue
      const key = `${msg.name}.${signal.name}`
      let series = seriesMap.get(key)
      if (!series) {
        series = {
          key,
          messageName: msg.name,
          signalName: signal.name,
          unit: signal.unit,
          points: [],
        }
        seriesMap.set(key, series)
      }
      series.points.push({ time: frame.relativeTime, value })
    }
  }

  return [...seriesMap.values()]
}

export interface IdRate {
  idHex: string
  id: number
  count: number
  rateHz: number
}

export function computeIdRates(frames: CanFrame[]): IdRate[] {
  if (!frames.length) return []
  const duration = Math.max(
    frames[frames.length - 1].relativeTime - frames[0].relativeTime,
    1e-6,
  )
  const counts = new Map<number, { idHex: string; count: number }>()
  for (const f of frames) {
    const cur = counts.get(f.id) ?? { idHex: f.idHex, count: 0 }
    cur.count += 1
    counts.set(f.id, cur)
  }
  return [...counts.entries()]
    .map(([id, v]) => ({
      id,
      idHex: v.idHex,
      count: v.count,
      rateHz: v.count / duration,
    }))
    .sort((a, b) => b.count - a.count)
}
