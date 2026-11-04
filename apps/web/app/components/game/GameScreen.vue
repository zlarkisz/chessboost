<script setup lang="ts">
import type { GameView } from '~/types/game'
import { computed } from 'vue'
import { TooltipProvider } from '@/components/ui/tooltip'
import BoostCounter from './BoostCounter.vue'
import BoostStatus from './BoostStatus.vue'
import GameActions from './GameActions.vue'
import GameBoard from './GameBoard.vue'
import MoveList from './MoveList.vue'
import PlayerClock from './PlayerClock.vue'

const props = defineProps<{ game: GameView }>()
const emit = defineEmits<{ offerDraw: [], resign: [] }>()

const bottom = computed(() => props.game.players[props.game.orientation])
const top = computed(() => props.game.players[props.game.orientation === 'white' ? 'black' : 'white'])
const timeOf = (color: 'white' | 'black') => color === 'white' ? props.game.clock.whiteMs : props.game.clock.blackMs
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <main class="game">
      <PlayerClock
        class="[grid-area:top]"
        placement="top"
        :player="top"
        :time-ms="timeOf(top.color)"
        :running="game.clock.running === top.color"
        :low-time-ms="game.clock.lowTimeMs"
      />
      <div class="[grid-area:counter] lg:hidden">
        <BoostCounter orientation="horizontal" :schedule="game.schedule" />
      </div>
      <GameBoard
        class="[grid-area:board]"
        :position="game.position"
        :orientation="game.orientation"
        :boosts="game.boosts"
        :effects="game.effects"
        :ply-count="game.plyCount"
      />
      <div class="hidden [grid-area:rail] lg:block">
        <BoostCounter class="h-full" orientation="vertical" :schedule="game.schedule" />
      </div>
      <PlayerClock
        class="[grid-area:bottom]"
        placement="bottom"
        :player="bottom"
        :time-ms="timeOf(bottom.color)"
        :running="game.clock.running === bottom.color"
        :low-time-ms="game.clock.lowTimeMs"
      />
      <div class="side">
        <BoostStatus
          class="[grid-area:status]"
          :schedule="game.schedule"
          :boosts="game.boosts"
          :effects="game.effects"
          :position="game.position"
        />
        <MoveList class="min-h-0 flex-1 [grid-area:moves]" :moves="game.moves" :ply-count="game.plyCount" />
        <GameActions
          class="[grid-area:actions]"
          :opponent-name="top.name"
          @offer-draw="emit('offerDraw')"
          @resign="emit('resign')"
        />
      </div>
    </main>
  </TooltipProvider>
</template>

<style scoped>
.game {
  display: grid;
  gap: 0.875rem;
  max-width: 34rem;
  margin-inline: auto;
  padding-block: 1rem;
  padding-inline: 1rem;
  grid-template-areas:
    "top"
    "counter"
    "board"
    "bottom"
    "status"
    "moves"
    "actions";
}

.side {
  display: contents;
}

@media (width >= 64rem) and (aspect-ratio >= 27/20) {
  .game {
    --side: 19rem;
    --rail: 0.625rem;
    --board: min(calc(100dvh - 3rem), calc(100vw - 3rem - var(--side) - var(--rail) - 2.5rem));
    max-width: none;
    padding-block: 1.5rem;
    padding-inline: 1.5rem;
    column-gap: 1.25rem;
    row-gap: 1.25rem;
    justify-content: center;
    grid-template-columns: var(--board) var(--rail) var(--side);
    grid-template-rows: auto auto minmax(0, 1fr) auto auto;
    height: 100dvh;
    max-height: calc(var(--board) + 3rem);
    grid-template-areas:
      "board rail top"
      "board rail status"
      "board rail moves"
      "board rail actions"
      "board rail bottom";
  }
}

@media (width >= 64rem) and (aspect-ratio < 27/20) {
  .game {
    --side: 15rem;
    --rail: 0.625rem;
    --player-row: 3.75rem;
    --row-gap: 0.75rem;
    --col-gap: 1.25rem;
    --board: min(
      calc(100dvh - 3rem - 2 * var(--player-row) - 2 * var(--row-gap)),
      calc(100vw - 3rem - var(--side) - var(--rail) - 2 * var(--col-gap))
    );
    max-width: none;
    min-height: 100dvh;
    padding-block: 1.5rem;
    padding-inline: 1.5rem;
    column-gap: var(--col-gap);
    row-gap: var(--row-gap);
    justify-content: center;
    align-content: center;
    grid-template-columns: var(--board) var(--rail) var(--side);
    grid-template-rows: var(--player-row) var(--board) var(--player-row);
    grid-template-areas:
      "top . side"
      "board rail side"
      "bottom . side";
  }

  .side {
    grid-area: side;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-height: 0;
  }
}
</style>
