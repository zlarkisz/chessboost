<script setup lang="ts">
import type { MoveRecord } from '~/types/game'
import { computed, onMounted, useTemplateRef } from 'vue'
import { boostCopy } from '~/lib/game-format'

const props = defineProps<{
  moves: MoveRecord[]
  plyCount: number
}>()

const rows = computed(() => {
  const out: { number: number, white?: MoveRecord, black?: MoveRecord }[] = []
  for (const move of props.moves) {
    const number = Math.ceil(move.ply / 2)
    const row = out[number - 1] ?? (out[number - 1] = { number })
    row[move.ply % 2 === 1 ? 'white' : 'black'] = move
  }
  return out
})

const list = useTemplateRef<HTMLOListElement>('list')
onMounted(() => {
  if (list.value) {
    list.value.scrollLeft = list.value.scrollWidth
    list.value.scrollTop = list.value.scrollHeight
  }
})
</script>

<template>
  <ol
    ref="list"
    aria-label="Moves"
    tabindex="0"
    class="flex gap-x-4 overflow-x-auto rounded-md py-1 text-sm whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex-col lg:gap-x-0 lg:overflow-x-visible lg:overflow-y-auto"
  >
    <li
      v-for="row in rows"
      :key="row.number"
      class="flex shrink-0 items-center gap-1 lg:grid lg:grid-cols-[2rem_5rem_5rem] lg:gap-0"
    >
      <span class="text-muted-foreground tabular-nums">{{ row.number }}.</span>
      <template v-for="move in [row.white, row.black]" :key="move?.ply ?? `${row.number}-empty`">
        <span
          v-if="move"
          class="relative flex items-center gap-1.5 rounded-sm px-1.5 py-0.5"
          :class="move.ply === plyCount && 'bg-muted font-medium'"
          :aria-current="move.ply === plyCount ? 'step' : undefined"
        >
          {{ move.san }}
          <template v-if="move.spawnedBoost">
            <span aria-hidden="true" class="inline-block size-1.5 rotate-45" :class="boostCopy[move.spawnedBoost].tone.mark" />
            <span class="sr-only">, {{ boostCopy[move.spawnedBoost].name.toLowerCase() }} boost spawned</span>
          </template>
        </span>
        <span v-else class="hidden lg:block" />
      </template>
    </li>
  </ol>
</template>
