import type { Component } from 'vue'
import type { BoostType, Color, PieceType } from '~/types/game'
import { ChevronsRight, Orbit, Shield } from '@lucide/vue'

interface BoostTone {
  icon: string
  shadow: string
  glow: string
  ui: string
  mark: string
  count?: string
}

export const boostCopy: Record<BoostType, { name: string, icon: Component, grants: string, tone: BoostTone }> = {
  'invulnerability': {
    name: 'Invulnerability',
    icon: Shield,
    grants: 'The piece that lands here can’t be captured for 1 move.',
    tone: {
      icon: 'text-boost-invuln',
      shadow: 'bg-boost-invuln/35',
      glow: '[--boost-glow-color:var(--boost-invuln-glow)]',
      ui: 'text-boost-invuln-ui',
      mark: 'bg-boost-invuln-ui',
      count: 'text-boost-invuln-deep',
    },
  },
  'extra-move': {
    name: 'Extra move',
    icon: ChevronsRight,
    grants: 'The piece that lands here gets an extra move.',
    tone: {
      icon: 'text-boost-extra',
      shadow: 'bg-boost-extra/35',
      glow: '[--boost-glow-color:var(--boost-extra-glow)]',
      ui: 'text-boost-extra-ui',
      mark: 'bg-boost-extra-ui',
    },
  },
  'teleport': {
    name: 'Teleport',
    icon: Orbit,
    grants: 'The piece that lands here gets a teleport.',
    tone: {
      icon: 'text-boost-teleport',
      shadow: 'bg-boost-teleport/35',
      glow: '[--boost-glow-color:var(--boost-teleport-glow)]',
      ui: 'text-boost-teleport-ui',
      mark: 'bg-boost-teleport-ui',
    },
  },
}

export function effectStatus(type: BoostType, movesLeft?: number): string {
  if (movesLeft === undefined)
    return boostCopy[type].name
  const moves = `${movesLeft} ${movesLeft === 1 ? 'move' : 'moves'} left`
  return type === 'invulnerability' ? `Can’t be captured, ${moves}` : `${boostCopy[type].name}, ${moves}`
}

export function pieceName(color: Color, type: PieceType): string {
  return `${color === 'white' ? 'White' : 'Black'} ${type}`
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function nextBoostText(interval: number, pliesSinceSpawn: number): string {
  const left = interval - pliesSinceSpawn
  return left === 1 ? 'Boost spawns after the next half-move' : `Next boost in ${left} half-moves`
}

const PIECE_CODE: Record<PieceType, string> = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P' }

export function pieceSrc(color: Color, type: PieceType): string {
  return `/pieces/${color === 'white' ? 'w' : 'b'}${PIECE_CODE[type]}.svg`
}
