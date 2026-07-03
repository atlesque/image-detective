<template>
  <header class="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-(--ui-border) bg-(--ui-bg) px-6 backdrop-blur-sm">
    <div class="flex items-center gap-3">
      <img src="/favicon.svg" alt="Logo" class="h-7 w-7" />
      <span class="text-lg font-semibold tracking-tight">Image Detective</span>
    </div>
    <UButton
      :icon="colorModeIcon"
      color="neutral"
      variant="ghost"
      @click="cycleColorMode"
      :aria-label="`Color mode: ${colorMode.preference}`"
    />
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const iconMap: Record<string, string> = {
  system: 'i-lucide-monitor',
  light: 'i-lucide-sun',
  dark: 'i-lucide-moon',
}

const colorModeIcon = computed(() => iconMap[colorMode.preference] ?? iconMap.system)

function cycleColorMode() {
  const modes = ['system', 'light', 'dark'] as const
  const current = modes.indexOf(colorMode.preference as typeof modes[number])
  const next = (current + 1) % modes.length
  colorMode.preference = modes[next]
}
</script>
