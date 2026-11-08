<script setup lang="ts">
import type { Color } from '~/types/game'
import { CircleAlert, LoaderCircle } from '@lucide/vue'
import { computed, ref, useId } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup } from '@/components/ui/radio-group'
import OptionTile from '~/components/new-game/OptionTile.vue'
import { useCreateGame } from '~/composables/useCreateGame'
import { boostCopy } from '~/lib/game-format'

useHead({ title: 'chessboost' })

const timeControls = [
  { value: '3+2', label: '3 + 2', category: 'Blitz' },
  { value: '5+0', label: '5 + 0', category: 'Blitz' },
  { value: '10+0', label: '10 + 0', category: 'Rapid' },
]
const colours: { value: Color | 'random', label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'random', label: 'Random' },
]
const boosts = Object.values(boostCopy)

const timeControl = ref<string>()
const colour = ref<Color | 'random'>('random')

const { status, create } = useCreateGame()
const creating = computed(() => status.value === 'creating')

const timeLabelId = useId()
const colourLabelId = useId()
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 py-8">
    <div class="flex w-full max-w-md flex-col items-center gap-6">
      <h1 class="text-4xl font-semibold tracking-tight">
        chessboost
      </h1>

      <Card class="w-full" :aria-busy="creating">
        <CardHeader>
          <CardTitle>New game</CardTitle>
          <CardDescription>Pick a clock and a side. Boosts are always on.</CardDescription>
        </CardHeader>

        <CardContent class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <div :id="timeLabelId" class="text-sm font-medium">
              Time control
            </div>
            <RadioGroup v-model="timeControl" :aria-labelledby="timeLabelId" :disabled="creating" class="grid-cols-3">
              <OptionTile
                v-for="tc in timeControls"
                :key="tc.value"
                :value="tc.value"
                :label="tc.label"
                :sublabel="tc.category"
              />
            </RadioGroup>
          </div>

          <div class="flex flex-col gap-2">
            <div :id="colourLabelId" class="text-sm font-medium">
              Colour
            </div>
            <RadioGroup v-model="colour" :aria-labelledby="colourLabelId" :disabled="creating" class="grid-cols-3">
              <OptionTile
                v-for="c in colours"
                :key="c.value"
                :value="c.value"
                :label="c.label"
              />
            </RadioGroup>
          </div>

          <div class="flex flex-col gap-2 text-sm">
            <p class="text-muted-foreground">
              Boosts on — a boost appears after every 13th half-move.
            </p>
            <ul class="flex flex-wrap gap-x-4 gap-y-2">
              <li v-for="b in boosts" :key="b.name" class="flex items-center gap-2">
                <component :is="b.icon" aria-hidden="true" class="size-4 shrink-0" :class="b.tone.ui" />
                {{ b.name }}
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter class="flex-col items-stretch gap-3">
          <Button
            size="lg"
            class="w-full"
            :class="creating && 'disabled:opacity-100'"
            :disabled="!timeControl || creating"
            @click="create({ timeControl, colour })"
          >
            <template v-if="creating">
              <LoaderCircle aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
              Creating game…
            </template>
            <template v-else>
              Start game
            </template>
          </Button>
          <p role="alert" class="flex h-5 items-center gap-2 text-sm text-destructive">
            <template v-if="status === 'error'">
              <CircleAlert aria-hidden="true" class="size-4 shrink-0" />
              Couldn't create the game. Try again.
            </template>
          </p>
        </CardFooter>
      </Card>

      <Button variant="link" size="lg" as-child :class="creating && 'pointer-events-none opacity-50'">
        <NuxtLink
          to="/game/demo"
          :aria-disabled="creating || undefined"
          :tabindex="creating ? -1 : undefined"
        >
          Open the demo game
        </NuxtLink>
      </Button>
    </div>
  </main>
</template>
