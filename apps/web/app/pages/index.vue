<script setup lang="ts">
import { Button } from '@/components/ui/button'

useHead({ title: 'chessboost' })
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4">
    <div class="flex flex-col items-center gap-5">
      <h1 class="text-4xl font-semibold tracking-tight">
        chessboost
      </h1>
      <Button variant="secondary" size="lg" as-child>
        <NuxtLink to="/game/demo">
          Open the demo game
        </NuxtLink>
      </Button>
    </div>
  </main>
</template>
