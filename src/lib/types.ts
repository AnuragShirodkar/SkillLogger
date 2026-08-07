export type CanDirection = 'Rx' | 'Tx'

export interface AscHeader {
  date?: string
  base: 'hex' | 'dec'
  timestamps: 'absolute' | 'relative'
  internalEvents: boolean
  version?: string
}

export interface CanFrame {
  index: number
  timestamp: number
  relativeTime: number
  channel: number
  id: number
  idHex: string
  isExtended: boolean
  direction: CanDirection
  isRemote: boolean
  dlc: number
  data: number[]
  dataHex: string
  raw: string
  kind: 'data' | 'other'
}

export interface AscParseResult {
  header: AscHeader
  frames: CanFrame[]
  otherLines: number
  fileName: string
  /** Original ASC file text for raw view. */
  rawText: string
}

export type ByteOrder = 'intel' | 'motorola'
export type SignType = 'unsigned' | 'signed'

export interface DbcSignal {
  id: string
  name: string
  startBit: number
  length: number
  byteOrder: ByteOrder
  sign: SignType
  factor: number
  offset: number
  minimum: number
  maximum: number
  unit: string
}

export interface DbcMessage {
  id: string
  name: string
  canId: number
  dlc: number
  isExtended: boolean
  signals: DbcSignal[]
}

export interface DecodedPoint {
  time: number
  value: number
}

export interface DecodedSeries {
  key: string
  messageName: string
  signalName: string
  unit: string
  points: DecodedPoint[]
}
