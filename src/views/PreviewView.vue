<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { frames } from '../data/frames'
import { filters } from '../data/filters'
import { stickerCategories } from '../data/stickers'

const router = useRouter()

const frameId = sessionStorage.getItem('riell-frame') || frames[0]!.id
const photos = JSON.parse(sessionStorage.getItem('riell-photos') || '[]') as string[]

const activeFrame = ref(frames.find((frame) => frame.id === frameId) ?? frames[0]!)
const selectedFilter = ref(filters[0]!)
const activeStickerCategory = ref(stickerCategories[0]!)
const showAnimation = ref(true)
const customText = ref(sessionStorage.getItem('riell-custom-text') || '')

const isJeansFrame =
  activeFrame.value.image?.includes('test2') ||
  activeFrame.value.id === 'jeans-pocket-polaroid'

const FRAME_W = activeFrame.value.width || 1181
const FRAME_H = activeFrame.value.height || 1772

type StickerItem = {
  id: number
  emoji: string
  x: number
  y: number
}

type Slot = {
  x: number
  y: number
  w: number
  h: number
  round?: boolean
}

const fallbackSlots: Slot[] = [
  { x: 62, y: 54, w: 502, h: 503, round: true },
  { x: 615, y: 119, w: 512, h: 435 },
  { x: 62, y: 647, w: 503, h: 526 },
  { x: 615, y: 630, w: 512, h: 512, round: true },
  { x: 62, y: 1217, w: 503, h: 503, round: true },
  { x: 615, y: 1256, w: 512, h: 425 },
]

const frameSlots: Slot[] = (
  activeFrame.value.slots?.length ? activeFrame.value.slots : fallbackSlots
).map((slot, index) => ({
  ...slot,
  round: activeFrame.value.id === 'vintage-red' ? [0, 3, 4].includes(index) : false,
}))

const placedStickers = ref<StickerItem[]>([])
const draggingId = ref<number | null>(null)

onMounted(() => {
  setTimeout(() => {
    showAnimation.value = false
  }, 1200)
})

function saveCustomText() {
  sessionStorage.setItem('riell-custom-text', customText.value.trim())
}

function addSticker(emoji: string) {
  placedStickers.value.push({
    id: Date.now() + Math.random(),
    emoji,
    x: 120,
    y: 120,
  })
}

function startDrag(id: number) {
  draggingId.value = id
}

function dragSticker(e: MouseEvent | TouchEvent) {
  if (draggingId.value === null) return

  const sticker = placedStickers.value.find((s) => s.id === draggingId.value)
  if (!sticker) return

  const point = 'touches' in e ? e.touches[0] : e
  if (!point) return

  const preview = document.getElementById('preview-area')
  if (!preview) return

  const rect = preview.getBoundingClientRect()
  sticker.x = point.clientX - rect.left - 24
  sticker.y = point.clientY - rect.top - 24
}

function stopDrag() {
  draggingId.value = null
}

function removeSticker(id: number) {
  placedStickers.value = placedStickers.value.filter((s) => s.id !== id)
}

function retakePhoto(index: number) {
  sessionStorage.setItem('riell-retake-index', String(index))
  sessionStorage.setItem('riell-photos', JSON.stringify(photos))
  sessionStorage.setItem('riell-frame', activeFrame.value.id)

  router.push(`/session/${activeFrame.value.id}`)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height
  const slotRatio = w / h

  let drawW = w
  let drawH = h
  let offsetX = 0
  let offsetY = 0

  if (imgRatio > slotRatio) {
    drawH = h
    drawW = h * imgRatio
    offsetX = (w - drawW) / 2
  } else {
    drawW = w
    drawH = w / imgRatio
    offsetY = (h - drawH) / 2
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH)
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  const now = new Date()
  const dateText = now
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()

  const text = customText.value.trim()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,.18)'
  ctx.shadowBlur = 12
  ctx.fillStyle = isJeansFrame ? '#ffffff' : '#7c5b45'

  if (text) {
    ctx.font = isJeansFrame ? '26px Fredoka, Arial' : '24px Fredoka, Arial'
    ctx.fillText(`♡ ${text.toUpperCase()} ♡`, FRAME_W / 2, FRAME_H - 118)
  }

  ctx.font = isJeansFrame ? '22px Fredoka, Arial' : '20px Fredoka, Arial'
  ctx.fillText('✦ RIELL BOOTH ✦', FRAME_W / 2, text ? FRAME_H - 78 : FRAME_H - 92)

  ctx.font = isJeansFrame ? '18px Fredoka, Arial' : '17px Fredoka, Arial'
  ctx.fillText(dateText, FRAME_W / 2, text ? FRAME_H - 48 : FRAME_H - 58)

  ctx.restore()
}

async function downloadResult() {
  const preview = document.getElementById('preview-area')
  if (!preview) return

  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = activeFrame.value.bg || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.filter = selectedFilter.value.css

  for (let i = 0; i < photos.length && i < frameSlots.length; i++) {
    const photo = photos[i]
    const slot = frameSlots[i]
    if (!photo || !slot) continue

    const img = await loadImage(photo)

    ctx.save()
    ctx.beginPath()

    if (slot.round) {
      ctx.arc(
        slot.x + slot.w / 2,
        slot.y + slot.h / 2,
        Math.min(slot.w, slot.h) / 2,
        0,
        Math.PI * 2
      )
    } else {
      ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 26)
    }

    ctx.clip()
    drawCoverImage(ctx, img, slot.x, slot.y, slot.w, slot.h)
    ctx.restore()
  }

  ctx.filter = 'none'

  const frameImg = await loadImage(activeFrame.value.image || '/frames/test1.png')
  ctx.drawImage(frameImg, 0, 0, FRAME_W, FRAME_H)

  drawWatermark(ctx)

  const scaleX = FRAME_W / preview.clientWidth
  const scaleY = FRAME_H / preview.clientHeight

  ctx.font = '70px Arial'
  ctx.textAlign = 'left'

  placedStickers.value.forEach((sticker) => {
    ctx.fillText(sticker.emoji, sticker.x * scaleX, (sticker.y + 60) * scaleY)
  })

  const link = document.createElement('a')
  link.download = 'riell-booth.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <main
    class="page preview-page"
    @mousemove="dragSticker"
    @mouseup="stopDrag"
    @touchmove="dragSticker"
    @touchend="stopDrag"
  >
    <Transition name="strip">
      <div v-if="showAnimation" class="film-loading">
        📸 Cekrekkkk...
      </div>
    </Transition>

    <section class="preview-wrap">
      <div class="preview-head">
        <p class="eyebrow center">final touch</p>
        <h1>Preview Result</h1>
        <p v-if="photos.length">Pilih filter, sticker, memory text, lalu download.</p>
        <p v-else>Belum ada foto. Balik ambil foto dulu.</p>
      </div>

      <div
        v-if="photos.length"
        id="preview-area"
        class="frame-canvas"
        :style="{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }"
      >
        <img
          v-for="(photo, index) in photos.slice(0, 6)"
          :key="index"
          :src="photo"
          class="photo"
          :class="{ 'is-round': frameSlots[index]?.round }"
          :style="{
            left: (frameSlots[index]!.x / FRAME_W) * 100 + '%',
            top: (frameSlots[index]!.y / FRAME_H) * 100 + '%',
            width: (frameSlots[index]!.w / FRAME_W) * 100 + '%',
            height: (frameSlots[index]!.h / FRAME_H) * 100 + '%',
            filter: selectedFilter.css,
          }"
        />

        <button
          v-for="(_, index) in photos.slice(0, 6)"
          :key="'retake-' + index"
          class="retake-photo-btn"
          :style="{
            left: (frameSlots[index]!.x / FRAME_W) * 100 + '%',
            top: (frameSlots[index]!.y / FRAME_H) * 100 + '%',
          }"
          @click="retakePhoto(index)"
        >
          ↺
        </button>

        <img
          :src="activeFrame.image || '/frames/test1.png'"
          class="frame-overlay"
        />

        <div
          v-for="sticker in placedStickers"
          :key="sticker.id"
          class="placed-sticker"
          :style="{
            left: sticker.x + 'px',
            top: sticker.y + 'px',
          }"
          @mousedown="startDrag(sticker.id)"
          @touchstart="startDrag(sticker.id)"
          @dblclick="removeSticker(sticker.id)"
        >
          {{ sticker.emoji }}
        </div>
      </div>

      <div v-if="photos.length" class="editor-panel">
        <p class="panel-title">Memory Text</p>

        <input
          v-model="customText"
          class="memory-input"
          maxlength="24"
          placeholder="contoh: Bestie Night"
          @input="saveCustomText"
        />

        <p class="memory-preview">
          {{ customText ? `♡ ${customText} ♡` : '♡ Your Memory Text ♡' }}
        </p>
      </div>

      <div v-if="photos.length" class="editor-panel">
        <div>
          <p class="panel-title">Sticker</p>

          <div class="chip-row">
            <button
              v-for="category in stickerCategories"
              :key="category.id"
              class="chip"
              :class="{ active: activeStickerCategory.id === category.id }"
              @click="activeStickerCategory = category"
            >
              {{ category.name }}
            </button>
          </div>

          <div class="sticker-grid">
            <button
              v-for="sticker in activeStickerCategory.stickers"
              :key="sticker"
              class="sticker-btn"
              @click="addSticker(sticker)"
            >
              {{ sticker }}
            </button>
          </div>
        </div>

        <div>
          <p class="panel-title">Filter</p>

          <div class="chip-row">
            <button
              v-for="filter in filters"
              :key="filter.id"
              class="chip"
              :class="{ active: selectedFilter.id === filter.id }"
              @click="selectedFilter = filter"
            >
              {{ filter.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="bottom-actions">
        <button v-if="photos.length" class="riell-btn primary" @click="downloadResult">
          Download PNG
        </button>

        <button class="riell-btn soft" @click="router.push('/layout')">
          Retake All
        </button>
      </div>
    </section>
  </main>
</template>
