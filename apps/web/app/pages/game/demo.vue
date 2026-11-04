<script setup lang="ts">
import type { GameView } from '~/types/game'
import GameScreen from '~/components/game/GameScreen.vue'

useHead({ title: 'zlarkisz vs boost_hunter' })

const game: GameView = {
  plyCount: 15,
  orientation: 'white',
  position: {
    sideToMove: 'black',
    lastMove: { from: 'c1', to: 'g5' },
    pieces: [
      { square: 'a1', color: 'white', type: 'rook' },
      { square: 'b1', color: 'white', type: 'knight' },
      { square: 'd1', color: 'white', type: 'queen' },
      { square: 'e1', color: 'white', type: 'rook' },
      { square: 'g1', color: 'white', type: 'king' },
      { square: 'a2', color: 'white', type: 'pawn' },
      { square: 'b2', color: 'white', type: 'pawn' },
      { square: 'f2', color: 'white', type: 'pawn' },
      { square: 'g2', color: 'white', type: 'pawn' },
      { square: 'h2', color: 'white', type: 'pawn' },
      { square: 'c3', color: 'white', type: 'pawn' },
      { square: 'd3', color: 'white', type: 'pawn' },
      { square: 'f3', color: 'white', type: 'knight' },
      { square: 'c4', color: 'white', type: 'bishop' },
      { square: 'e4', color: 'white', type: 'pawn' },
      { square: 'g5', color: 'white', type: 'bishop' },
      { square: 'a8', color: 'black', type: 'rook' },
      { square: 'c8', color: 'black', type: 'bishop' },
      { square: 'd8', color: 'black', type: 'queen' },
      { square: 'f8', color: 'black', type: 'rook' },
      { square: 'g8', color: 'black', type: 'king' },
      { square: 'b7', color: 'black', type: 'pawn' },
      { square: 'c7', color: 'black', type: 'pawn' },
      { square: 'f7', color: 'black', type: 'pawn' },
      { square: 'g7', color: 'black', type: 'pawn' },
      { square: 'h7', color: 'black', type: 'pawn' },
      { square: 'a6', color: 'black', type: 'pawn' },
      { square: 'c6', color: 'black', type: 'knight' },
      { square: 'd6', color: 'black', type: 'pawn' },
      { square: 'f6', color: 'black', type: 'knight' },
      { square: 'c5', color: 'black', type: 'bishop' },
      { square: 'e5', color: 'black', type: 'pawn' },
    ],
  },
  boosts: [
    { id: 'boost-1', square: 'g4', type: 'teleport', spawnedAfterPly: 7 },
  ],
  effects: [
    { id: 'effect-1', square: 'g5', type: 'invulnerability', movesLeft: 1, appliedAfterPly: 15 },
  ],
  schedule: { interval: 7, pliesSinceSpawn: 1 },
  clock: { whiteMs: 272_000, blackMs: 238_000, running: 'black', lowTimeMs: 30_000 },
  players: {
    white: { name: 'zlarkisz', rating: 1650, color: 'white' },
    black: { name: 'boost_hunter', rating: 1710, color: 'black' },
  },
  moves: [
    { ply: 1, san: 'e4' },
    { ply: 2, san: 'e5' },
    { ply: 3, san: 'Nf3' },
    { ply: 4, san: 'Nc6' },
    { ply: 5, san: 'Bc4' },
    { ply: 6, san: 'Bc5' },
    { ply: 7, san: 'c3', spawnedBoost: 'teleport' },
    { ply: 8, san: 'Nf6' },
    { ply: 9, san: 'd3' },
    { ply: 10, san: 'd6' },
    { ply: 11, san: 'O-O' },
    { ply: 12, san: 'O-O' },
    { ply: 13, san: 'Re1' },
    { ply: 14, san: 'a6', spawnedBoost: 'invulnerability' },
    { ply: 15, san: 'Bg5' },
  ],
}
</script>

<template>
  <GameScreen :game="game" />
</template>
