export type Color = 'white' | 'black'

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type Square = `${File}${Rank}`

export interface Piece {
  square: Square
  color: Color
  type: PieceType
}

export interface Position {
  pieces: Piece[]
  sideToMove: Color
  lastMove?: { from: Square, to: Square }
}

export type BoostType = 'invulnerability' | 'extra-move' | 'teleport'

export interface BoostSquare {
  id: string
  square: Square
  type: BoostType
  spawnedAfterPly: number
}

export interface PieceEffect {
  id: string
  square: Square
  type: BoostType
  movesLeft?: number
  appliedAfterPly: number
}

export interface BoostSchedule {
  interval: number
  pliesSinceSpawn: number
}

export interface ClockState {
  whiteMs: number
  blackMs: number
  running: Color | null
  lowTimeMs: number
}

export interface Player {
  name: string
  rating: number
  color: Color
}

export interface MoveRecord {
  ply: number
  san: string
  spawnedBoost?: BoostType
}

export interface GameView {
  plyCount: number
  position: Position
  orientation: Color
  boosts: BoostSquare[]
  effects: PieceEffect[]
  schedule: BoostSchedule
  clock: ClockState
  players: Record<Color, Player>
  moves: MoveRecord[]
}
