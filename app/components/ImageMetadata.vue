<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex h-full items-center justify-center gap-3 text-muted"
    >
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
      <span class="text-sm">Extracting metadata…</span>
    </div>

    <!-- No metadata -->
    <div
      v-else-if="!hasMetadata"
      class="flex h-full flex-col items-center justify-center gap-3 text-muted"
    >
      <UIcon name="i-lucide-file-question" class="size-12" />
      <p class="text-sm">No metadata found in this image.</p>
    </div>

    <!-- Metadata sections -->
    <div v-else class="mx-auto max-w-2xl space-y-5 p-4">
      <!-- File info (from File object, always present) -->
      <section
        v-if="fileSection.rows.length"
        class="rounded-xl border border-default bg-(--ui-bg-elevated)/50 p-4"
      >
        <div class="mb-3 flex items-center gap-2">
          <UIcon :name="fileSection.icon" class="size-4 text-muted" />
          <h3 class="text-sm font-semibold">{{ fileSection.title }}</h3>
        </div>
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <template v-for="row in fileSection.rows" :key="'file-' + row.label">
            <dt class="text-muted whitespace-nowrap">{{ row.label }}</dt>
            <dd class="text-highlighted break-all">{{ row.value }}</dd>
          </template>
        </dl>
      </section>

      <!-- EXIF sections -->
      <section
        v-for="section in exifSections"
        :key="section.title"
        class="rounded-xl border border-default bg-(--ui-bg-elevated)/50 p-4"
      >
        <div class="mb-3 flex items-center gap-2">
          <UIcon :name="section.icon" class="size-4 text-muted" />
          <h3 class="text-sm font-semibold">{{ section.title }}</h3>
        </div>
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <template v-for="row in section.rows" :key="section.title + '-' + row.label">
            <dt class="text-muted whitespace-nowrap">{{ row.label }}</dt>
            <dd class="text-highlighted break-all">{{ row.value }}</dd>
          </template>
        </dl>
      </section>

      <!-- Fallback: render all remaining unknown tags -->
      <section
        v-if="otherSection.rows.length"
        class="rounded-xl border border-default bg-(--ui-bg-elevated)/50 p-4"
      >
        <div class="mb-3 flex items-center gap-2">
          <UIcon :name="otherSection.icon" class="size-4 text-muted" />
          <h3 class="text-sm font-semibold">{{ otherSection.title }}</h3>
        </div>
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <template v-for="row in otherSection.rows" :key="'other-' + row.label">
            <dt class="text-muted whitespace-nowrap">{{ row.label }}</dt>
            <dd class="text-highlighted break-all">{{ row.value }}</dd>
          </template>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MetadataRow {
  label: string
  value: string
}

interface MetadataSection {
  title: string
  icon: string
  rows: MetadataRow[]
}

const { metadata, imageFile, isLoading } = useImageStore()

const tagGroups: { title: string; icon: string; tags: string[] }[] = [
  {
    title: 'Image Info',
    icon: 'i-lucide-info',
    tags: [
      'Make', 'Model', 'Software', 'DateTimeOriginal', 'ModifyDate',
      'ImageWidth', 'ImageLength', 'ImageDescription',
      'Orientation', 'XResolution', 'YResolution', 'ResolutionUnit',
      'Artist', 'Copyright', 'DocumentName', 'HostComputer',
    ],
  },
  {
    title: 'EXIF',
    icon: 'i-lucide-camera',
    tags: [
      'ExposureTime', 'FNumber', 'ISO', 'ISOSpeedRatings',
      'ShutterSpeedValue', 'ApertureValue', 'ExposureProgram',
      'FocalLength', 'FocalLengthIn35mmFilm', 'MaxApertureValue',
      'Flash', 'ColorSpace', 'WhiteBalance', 'MeteringMode',
      'ExposureMode', 'ExposureBiasValue', 'DigitalZoomRatio',
      'SceneCaptureType', 'Contrast', 'Saturation', 'Sharpness',
      'LensModel', 'LensMake', 'SubjectDistanceRange',
      'BrightnessValue', 'LightSource', 'SensingMethod',
      'FileSource', 'SceneType', 'CustomRendered', 'GainControl',
      'CompressedBitsPerPixel', 'ComponentsConfiguration',
      'SubjectArea', 'FocalPlaneXResolution', 'FocalPlaneYResolution',
      'FocalPlaneResolutionUnit',
    ],
  },
  {
    title: 'GPS',
    icon: 'i-lucide-map-pin',
    tags: [
      'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
      'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
      'GPSTimeStamp', 'GPSDateStamp', 'GPSSpeed',
      'GPSSpeedRef', 'GPSImgDirection', 'GPSImgDirectionRef',
      'GPSDestBearing', 'GPSDestBearingRef', 'GPSProcessingMethod',
      'GPSVersionID', 'GPSHPositioningError',
    ],
  },
]

const hasMetadata = computed(() => {
  return metadata.value != null && Object.keys(metadata.value).length > 0
})

function formatValue(key: string, value: unknown): string {
  if (value == null) return '—'

  // Date objects from exifr
  if (value instanceof Date) {
    return value.toLocaleString()
  }

  // Arrays (e.g., GPS coordinates as [deg, min, sec])
  if (Array.isArray(value)) {
    // GPS-like array of 3 numbers: display as DMS
    if (
      value.length === 3 &&
      value.every((v) => typeof v === 'number')
    ) {
      return `${value[0]}° ${value[1]}′ ${value[2].toFixed(2)}″`
    }
    return value.map((v) => formatValue('', v)).join(', ')
  }

  // Numbers
  if (typeof value === 'number') {
    // Exposure time: small fractions displayed as reciprocal
    if (key === 'ExposureTime' || key === 'ShutterSpeedValue') {
      if (value < 1 && value > 0) {
        const denominator = Math.round(1 / value)
        return `1/${denominator}`
      }
    }
    // Round to reasonable precision
    if (Number.isInteger(value)) return String(value)
    return value.toPrecision(5)
  }

  // Booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  // Objects
  if (typeof value === 'object') {
    // Skip binary/buffer-like objects (objects with mostly numeric keys, e.g. ICC profile raw data)
    if (isBinaryObject(value as Record<string, unknown>)) {
      return ''
    }
    return JSON.stringify(value, null, 0)
  }

  return String(value)
}

function isBinaryObject(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj)
  if (keys.length === 0) return false
  // If all keys are numeric strings, it's likely a binary buffer/Uint8Array-like object
  return keys.every((k) => /^\d+$/.test(k))
}

function formatLabel(key: string): string {
  // Add spaces before capital letters for camelCase / PascalCase
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^ /, '')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .trim()
}

/** File info section – always present when a file is loaded */
const fileSection = computed<MetadataSection>(() => {
  const file = imageFile.value
  const rows: MetadataRow[] = []
  if (file) {
    rows.push({ label: 'Name', value: file.name })
    rows.push({ label: 'Type', value: file.type || 'Unknown' })
    const size =
      file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    rows.push({ label: 'Size', value: size })
    rows.push({ label: 'Last modified', value: new Date(file.lastModified).toLocaleString() })
  }
  return { title: 'File Info', icon: 'i-lucide-file', rows }
})

/** EXIF/gps sections based on known tag groups */
const exifSections = computed<MetadataSection[]>(() => {
  if (!metadata.value) return []

  const meta = metadata.value as Record<string, unknown>
  const usedKeys = new Set<string>()

  return tagGroups
    .map((group) => {
      const rows: MetadataRow[] = []
      for (const tag of group.tags) {
        if (tag in meta && meta[tag] != null && meta[tag] !== '') {
          const rawVal = meta[tag]
          // Skip arrays/objects that serialize to empty
          const formatted = formatValue(tag, rawVal)
          if (formatted === '' || formatted === '[]' || formatted === '{}') continue

          rows.push({
            label: formatLabel(tag),
            value: formatted,
          })
          usedKeys.add(tag)
        }
      }
      return { ...group, rows }
    })
    .filter((s) => s.rows.length > 0)
})

/** Catch-all for tags not in any predefined group */
const otherSection = computed<MetadataSection>(() => {
  if (!metadata.value) return { title: 'Other', icon: 'i-lucide-ellipsis', rows: [] }

  const meta = metadata.value as Record<string, unknown>
  const allKnownTags = new Set(tagGroups.flatMap((g) => g.tags))
  const rows: MetadataRow[] = []

  for (const [key, value] of Object.entries(meta)) {
    if (allKnownTags.has(key)) continue
    if (value == null || value === '') continue
    // Skip internal/exifr keys
    if (key.startsWith('_') || key === 'errors') continue

    const formatted = formatValue(key, value)
    if (formatted === '' || formatted === '[]' || formatted === '{}') continue

    rows.push({ label: formatLabel(key), value: formatted })
  }

  return { title: 'Other', icon: 'i-lucide-ellipsis', rows }
})
</script>
