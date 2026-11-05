<script setup lang="ts">
import { useId } from 'vue'
import { RadioGroupItem } from '@/components/ui/radio-group'

defineProps<{
  value: string
  label: string
  sublabel?: string
}>()

const id = useId()
</script>

<template>
  <label
    :for="id"
    class="group flex h-14 min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 sm:gap-2.5 sm:px-3"
  >
    <RadioGroupItem
      :id="id"
      :value="value"
      class="focus-visible:border-input focus-visible:ring-0 disabled:opacity-100"
    />
    <span class="flex min-w-0 flex-col">
      <span class="truncate text-sm font-medium">{{ label }}</span>
      <span v-if="sublabel" class="truncate text-xs text-muted-foreground group-has-[[data-state=checked]]:text-foreground/65">{{ sublabel }}</span>
    </span>
  </label>
</template>
