import exifr from 'exifr'

export type FitMode = 'cover-height' | 'cover-width'

export function useImageStore() {
  const imageSrc = useState<string | null>('image-src', () => null)
  const imageFile = useState<File | null>('image-file', () => null)
  const metadata = useState<Record<string, unknown> | null>('image-metadata', () => null)
  const activeTab = useState<string>('image-tab', () => 'image')
  const isLoading = useState<boolean>('image-loading', () => false)
  const fitMode = useState<FitMode>('image-fit-mode', () => 'cover-height')

  async function setImage(file: File, src: string) {
    imageSrc.value = src
    imageFile.value = file
    metadata.value = null
    activeTab.value = 'image'
    await extractMetadata()
  }

  async function extractMetadata() {
    if (!imageFile.value) return
    isLoading.value = true
    try {
      const result = await exifr.parse(imageFile.value, true)
      metadata.value = result || null
    } catch (err) {
      console.error('Failed to extract metadata:', err)
      metadata.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearImage() {
    imageSrc.value = null
    imageFile.value = null
    metadata.value = null
    activeTab.value = 'image'
    isLoading.value = false
    fitMode.value = 'cover-height'
  }

  function toggleFitMode() {
    fitMode.value = fitMode.value === 'cover-height' ? 'cover-width' : 'cover-height'
  }

  return {
    imageSrc,
    imageFile,
    metadata,
    activeTab,
    isLoading,
    fitMode,
    setImage,
    clearImage,
    extractMetadata,
    toggleFitMode,
  }
}
