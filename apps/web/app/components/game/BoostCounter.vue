<script setup lang="ts">
import type { BoostSchedule } from '~/types/game'
import { nextBoostText } from '~/lib/game-format'

const props = defineProps<{
  schedule: BoostSchedule
  orientation: 'vertical' | 'horizontal'
}>()

function cellClass(i: number): string {
  if (i <= props.schedule.pliesSinceSpawn)
    return 'bg-counter-filled'
  if (i === props.schedule.pliesSinceSpawn + 1)
    return 'ring-2 ring-counter-filled ring-inset'
  return 'bg-counter-empty'
}
</script>

<template>
  <div v-if="props.orientation === 'vertical'" aria-hidden="true" class="flex flex-col-reverse gap-1 py-1.5">
    <span
      v-for="i in schedule.interval"
      :key="i"
      class="w-2.5 flex-1 rounded-[2px]"
      :class="cellClass(i)"
    />
  </div>

  <div v-else class="flex items-center gap-3">
    <div aria-hidden="true" class="flex w-28 shrink-0 gap-1">
      <span
        v-for="i in schedule.interval"
        :key="i"
        class="h-2.5 flex-1 rounded-[2px]"
        :class="cellClass(i)"
      />
    </div>
    <p class="text-sm text-muted-foreground">
      {{ nextBoostText(schedule.interval, schedule.pliesSinceSpawn) }}
    </p>
  </div>
</template>
