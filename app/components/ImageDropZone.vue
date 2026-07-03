<template>
  <div
    class="flex flex-1 flex-col items-center justify-center p-4"
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
        ? 'border-(--ui-primary) bg-(--ui-primary)/5'
        : 'border-(--ui-border) hover:border-(--ui-primary)/50 hover:bg-(--ui-bg-elevated)/50'"
      @click="openFilePicker"
    >
      <div class="flex flex-col items-center gap-4 p-12 text-center">
        <UIcon name="i-lucide-image-plus" class="size-16 text-(--ui-text-muted)" />
        <div>
          <p class="text-lg font-medium">Drag &amp; drop an image here</p>
          <p class="mt-1 text-sm text-(--ui-text-muted)">or click to browse your files</p>
        </div>
        <p class="text-xs text-(--ui-text-muted)">Supports PNG, JPG, GIF, WebP, SVG</p>
      </div>
    </div>

    <!-- Image display -->
    <div
      v-else
      class="flex flex-1 cursor-pointer items-center justify-center"
      @click="openFilePicker"
      title="Click to choose another image"
    >
      <img
        :src="imageSrc"
        alt="Uploaded image"
        class="max-h-full max-w-full rounded-lg object-contain shadow-lg"
      />
    </div>

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
const imageSrc = ref<string | null>(null)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

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
    imageSrc.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
</script>
