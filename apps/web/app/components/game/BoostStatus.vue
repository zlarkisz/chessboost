<script setup lang="ts">
import type { BoostSchedule, BoostSquare, PieceEffect, Position } from '~/types/game'
import { computed } from 'vue'
import { boostCopy, effectStatus, nextBoostText, pieceName, pieceSrc } from '~/lib/game-format'

const props = defineProps<{
  schedule: BoostSchedule
  boosts: BoostSquare[]
  effects: PieceEffect[]
  position: Position
}>()

const effectRows = computed(() => props.effects.flatMap((effect) => {
  const piece = props.position.pieces.find(p => p.square === effect.square)
  if (!piece)
    return []
  return [{
    effect,
    name: pieceName(piece.color, piece.type),
    src: pieceSrc(piece.color, piece.type),
  }]
}))
</script>

<template>
  <section aria-labelledby="boost-status-heading" class="flex flex-col gap-3 text-sm">
    <h2 id="boost-status-heading" class="sr-only">
      Boosts
    </h2>
    <p class="hidden text-muted-foreground lg:block">
      {{ nextBoostText(schedule.interval, schedule.pliesSinceSpawn) }}
    </p>

    <ul v-if="boosts.length || effectRows.length" class="flex flex-col gap-2.5">
      <li v-for="b in boosts" :key="b.id" class="flex items-center gap-3">
        <span class="grid size-7 shrink-0 place-items-center">
          <component :is="boostCopy[b.type].icon" aria-hidden="true" class="size-5" :class="boostCopy[b.type].tone.ui" />
        </span>
        <span class="leading-snug">
          {{ boostCopy[b.type].name }} on {{ b.square }}
          <span class="block text-muted-foreground">Not taken yet</span>
        </span>
      </li>
      <li v-for="row in effectRows" :key="row.effect.id" class="flex items-center gap-3">
        <span class="relative size-7 shrink-0">
          <span class="boost-glow absolute -inset-0.5 rounded-full" :class="boostCopy[row.effect.type].tone.glow" />
          <img :src="row.src" alt="" class="relative size-7">
        </span>
        <span class="leading-snug">
          {{ row.name }} on {{ row.effect.square }}
          <span class="block" :class="boostCopy[row.effect.type].tone.ui">{{ effectStatus(row.effect.type, row.effect.movesLeft) }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>
