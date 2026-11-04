<script setup lang="ts">
import { Flag, Handshake } from '@lucide/vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

defineProps<{ opponentName: string }>()
const emit = defineEmits<{ offerDraw: [], resign: [] }>()
</script>

<template>
  <div class="flex gap-2">
    <Button variant="secondary" size="lg" class="flex-1" @click="emit('offerDraw')">
      <Handshake aria-hidden="true" />
      Offer draw
    </Button>
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button variant="destructive" size="lg" class="flex-1">
          <Flag aria-hidden="true" />
          Resign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resign this game?</AlertDialogTitle>
          <AlertDialogDescription>{{ opponentName }} wins.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep playing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="emit('resign')">
            Resign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
