<template>
  <main class="min-h-screen bg-background p-8 text-foreground">
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>chessboost</CardTitle>
        <CardDescription>Theme smoke test</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="grid w-32 grid-cols-4 overflow-hidden rounded-md">
          <div v-for="i in 16" :key="i" class="relative aspect-square" :class="(Math.floor((i - 1) / 4) + i) % 2 ? 'bg-board-dark' : 'bg-board-light'">
            <div v-if="i === 6" class="absolute inset-0 bg-highlight" />
            <div v-if="i === 11" class="absolute inset-1 rounded-sm bg-boost ring-2 ring-boost/40" />
          </div>
        </div>
        <span class="w-fit rounded-md bg-boost px-2 py-1 text-xs font-medium text-boost-foreground">Boost: teleport</span>
        <span class="w-fit rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">New game</span>
        <span class="text-sm text-muted-foreground">Muted text on card</span>
      </CardContent>
    </Card>
  </main>
</template>
