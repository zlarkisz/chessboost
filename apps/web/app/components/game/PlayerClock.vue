<script setup lang="ts">
import type { Player } from '~/types/game'
import { computed } from 'vue'
import { formatClock } from '~/lib/game-format'

const props = defineProps<{
  player: Player
  timeMs: number
  running: boolean
  lowTimeMs: number
  placement: 'top' | 'bottom'
}>()

const text = computed(() => formatClock(props.timeMs))
const low = computed(() => props.timeMs <= props.lowTimeMs)
const label = computed(() => {
  const [m, s] = text.value.split(':').map(Number)
  return `${props.player.color} clock, ${m} min ${s} s${props.running ? ', running' : ''}`
})
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 wide:items-start wide:justify-start wide:gap-2"
    :class="placement === 'bottom' ? 'wide:flex-col-reverse' : 'wide:flex-col'"
  >
    <p class="flex min-w-0 items-baseline gap-2">
      <span class="truncate font-medium">{{ player.name }}</span>
      <span class="text-sm text-muted-foreground tabular-nums">{{ player.rating }}</span>
    </p>
    <div
      role="timer"
      :aria-label="label"
      class="shrink-0 rounded-md px-3 py-1.5 text-[2rem] leading-none font-[650] tracking-tight tabular-nums font-stretch-[75%] lg:px-4 lg:py-2 lg:text-[2.75rem]"
      :class="running
        ? (low ? 'bg-clock-low text-clock-active-foreground' : 'bg-clock-active text-clock-active-foreground')
        : (low ? 'bg-clock text-clock-low' : 'bg-clock text-clock-foreground')"
    >
      <span
        v-for="(ch, i) in text"
        :key="i"
        aria-hidden="true"
        class="inline-block text-center"
        :class="ch === ':' ? 'w-[0.3em]' : 'w-[1ch]'"
      >{{ ch }}</span>
    </div>
  </div>
</template>
