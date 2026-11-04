<script setup lang="ts">
import type { BoostSquare, Color, File, PieceEffect, Position, Rank, Square } from '~/types/game'
import { computed } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { boostCopy, effectStatus, pieceName, pieceSrc } from '~/lib/game-format'

const props = defineProps<{
  position: Position
  orientation: Color
  boosts: BoostSquare[]
  effects: PieceEffect[]
  plyCount: number
}>()

const FILES: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS: Rank[] = [8, 7, 6, 5, 4, 3, 2, 1]

const squares = computed(() => {
  const files = props.orientation === 'white' ? FILES : [...FILES].reverse()
  const ranks = props.orientation === 'white' ? RANKS : [...RANKS].reverse()
  const pieces = new Map(props.position.pieces.map(p => [p.square, p]))
  const boosts = new Map(props.boosts.map(b => [b.square, b]))
  const effects = new Map(props.effects.map(e => [e.square, e]))
  const last = props.position.lastMove

  return ranks.flatMap((rank, row) => files.map((file, col) => {
    const square: Square = `${file}${rank}`
    const piece = pieces.get(square)
    return {
      square,
      file,
      rank,
      dark: (FILES.indexOf(file) + rank) % 2 === 1,
      piece,
      pieceSrc: piece && pieceSrc(piece.color, piece.type),
      pieceLabel: piece && pieceName(piece.color, piece.type),
      boost: boosts.get(square),
      effect: effects.get(square),
      lastMove: last?.from === square || last?.to === square,
      showFile: row === 7,
      showRank: col === 0,
    }
  }))
})

const sideLabel = computed(() => `Board, ${props.position.sideToMove} to move`)
</script>

<template>
  <div class="@container rounded-md bg-board-frame p-1.5" role="group" :aria-label="sideLabel">
    <div class="grid aspect-square grid-cols-8 overflow-hidden rounded-[3px]">
      <div
        v-for="s in squares"
        :key="s.square"
        class="relative"
        :class="s.dark ? 'bg-board-dark' : 'bg-board-light'"
      >
        <div v-if="s.lastMove" class="absolute inset-0 bg-highlight" />

        <span
          v-if="s.showRank"
          aria-hidden="true"
          class="absolute top-[0.4cqw] left-[0.6cqw] text-[2.1cqw] leading-none font-semibold"
          :class="s.dark ? 'text-board-light' : 'text-board-dark'"
        >{{ s.rank }}</span>
        <span
          v-if="s.showFile"
          aria-hidden="true"
          class="absolute right-[0.7cqw] bottom-[0.3cqw] text-[2.1cqw] leading-none font-semibold"
          :class="s.dark ? 'text-board-light' : 'text-board-dark'"
        >{{ s.file }}</span>

        <Tooltip v-if="s.boost">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="absolute inset-0 outline-none focus-visible:outline-3 focus-visible:outline-solid focus-visible:-outline-offset-3 focus-visible:outline-board-frame"
              :class="s.boost.spawnedAfterPly === plyCount && 'motion-safe:animate-boost-appear'"
              :aria-label="`${boostCopy[s.boost.type].name} boost on ${s.square}`"
            >
              <span
                aria-hidden="true"
                class="absolute right-[24%] bottom-[12%] left-[24%] h-[13%] rounded-[50%]"
                :class="boostCopy[s.boost.type].tone.shadow"
              />
              <component
                :is="boostCopy[s.boost.type].icon"
                aria-hidden="true"
                :stroke-width="2.25"
                class="boost-outline absolute top-[14%] left-[29%] size-[42%]"
                :class="boostCopy[s.boost.type].tone.icon"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" class="flex-col items-start gap-0.5">
            <span class="font-semibold">{{ boostCopy[s.boost.type].name }} on {{ s.square }}</span>
            <span>{{ boostCopy[s.boost.type].grants }}</span>
          </TooltipContent>
        </Tooltip>

        <template v-if="s.piece">
          <Tooltip v-if="s.effect">
            <TooltipTrigger as-child>
              <button
                type="button"
                class="absolute inset-0 outline-none focus-visible:outline-3 focus-visible:outline-solid focus-visible:-outline-offset-3 focus-visible:outline-board-frame"
                :aria-label="`${s.pieceLabel} on ${s.square}: ${effectStatus(s.effect.type, s.effect.movesLeft)}`"
              >
                <span
                  aria-hidden="true"
                  class="boost-glow absolute inset-[6%] rounded-full"
                  :class="[boostCopy[s.effect.type].tone.glow, s.effect.appliedAfterPly === plyCount && 'motion-safe:animate-boost-fade-in']"
                />
                <img :src="s.pieceSrc" alt="" draggable="false" class="absolute inset-0 size-full select-none">
                <component
                  :is="boostCopy[s.effect.type].icon"
                  aria-hidden="true"
                  :stroke-width="2.5"
                  class="boost-outline absolute top-[4%] right-[4%] size-[24%]"
                  :class="[boostCopy[s.effect.type].tone.icon, s.effect.appliedAfterPly === plyCount && 'motion-safe:animate-boost-fade-in']"
                />
                <span
                  v-if="s.effect.movesLeft !== undefined"
                  aria-hidden="true"
                  class="boost-outline absolute right-[6%] bottom-[2%] text-[3cqw] leading-none font-bold tabular-nums"
                  :class="[boostCopy[s.effect.type].tone.count ?? 'text-foreground', s.effect.appliedAfterPly === plyCount && 'motion-safe:animate-boost-fade-in']"
                >{{ s.effect.movesLeft }}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" class="flex-col items-start gap-0.5">
              <span class="font-semibold">{{ s.pieceLabel }} on {{ s.square }}</span>
              <span>{{ effectStatus(s.effect.type, s.effect.movesLeft) }}</span>
            </TooltipContent>
          </Tooltip>
          <img
            v-else
            :src="s.pieceSrc"
            :alt="`${s.pieceLabel} on ${s.square}`"
            draggable="false"
            class="absolute inset-0 size-full select-none"
          >
        </template>
      </div>
    </div>
  </div>
</template>
