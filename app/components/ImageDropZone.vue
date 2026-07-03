<template>
  <div
    class="flex min-h-0 flex-1 flex-col items-center justify-center p-4"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <!-- Empty state: drop zone -->
    <div
      v-if="!imageSrc"
      class="flex w-full max-w-2xl flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-200"
      :class="isDragging
        ? 'border-primary bg-(--ui-primary)/5'
        : 'border-default hover:border-(--ui-primary)/50 hover:bg-(--ui-bg-elevated)/50'"
      @click="openFilePicker"
    >
      <div class="flex flex-col items-center gap-4 p-12 text-center">
        <UIcon name="i-lucide-image-plus" class="size-16 text-muted" />
        <div>
          <p class="text-lg font-medium">Drag &amp; drop an image here</p>
          <p class="mt-1 text-sm text-muted">or click to browse your files</p>
        </div>
        <p class="text-xs text-muted">Supports PNG, JPG, GIF, WebP, SVG</p>
      </div>
    </div>

    <!-- Tabbed display when image is loaded -->
    <template v-else>
      <!-- Toolbar: tabs + change-image button + fit-mode toggle -->
      <div class="flex w-full items-center gap-2 px-2">
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="link"
          :content="false"
          class="flex-1"
        />
        <UButton
          :icon="fitModeIcon"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="toggleFitMode"
          :title="`Fit: ${fitModeLabel}`"
        />
        <UButton
          icon="i-lucide-image-plus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="openFilePicker"
          title="Choose another image"
        />
      </div>

      <!-- Tab content -->
      <div class="flex min-h-0 w-full flex-1 overflow-auto">
        <!-- Image tab -->
        <div
          v-if="activeTab === 'image'"
          class="grid flex-1 cursor-pointer overflow-auto p-4"
          style="place-items: safe center"
          @click="openFilePicker"
          title="Click to choose another image"
        >
          <img
            :src="imageSrc"
            alt="Uploaded image"
            class="min-h-0 min-w-0 rounded-lg object-contain shadow-lg"
            :class="imageFitClasses"
          />
        </div>

        <!-- Metadata tab -->
        <ImageMetadata v-if="activeTab === 'metadata'" />
      </div>
    </template>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { FitMode } from '~/composables/useImageStore'

const { imageSrc, activeTab, fitMode, setImage } = useImageStore()
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const tabItems: TabsItem[] = [
  { label: 'Image', icon: 'i-lucide-image', value: 'image' },
  { label: 'Metadata', icon: 'i-lucide-file-text', value: 'metadata' },
]

const fitModeConfig: Record<FitMode, { icon: string; label: string }> = {
  'cover-height': { icon: 'i-lucide-arrow-up-down',  label: 'Fit height' },
  'cover-width':  { icon: 'i-lucide-arrow-left-right', label: 'Fit width' },
}

const fitModeIcon = computed(() => fitModeConfig[fitMode.value]?.icon ?? 'i-lucide-arrow-up-down')
const fitModeLabel = computed(() => fitModeConfig[fitMode.value]?.label ?? 'Fit height')

const imageFitClasses = computed(() => {
  return fitMode.value === 'cover-height' ? 'max-h-full' : 'max-w-full'
})

function toggleFitMode() {
  fitMode.value = fitMode.value === 'cover-height' ? 'cover-width' : 'cover-height'
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function onDragEnter() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    processFile(file)
  }
  // Reset so the same file can be re-selected
  input.value = ''
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const src = e.target?.result as string
    if (src) {
      setImage(file, src)
    }
  }
  reader.readAsDataURL(file)
}
</script>
