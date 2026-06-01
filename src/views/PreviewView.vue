<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { frames } from '../data/frames'
import { filters } from '../data/filters'
import { stickerCategories } from '../data/stickers'
import { boothState } from '../stores/boothStore'

const router = useRouter()

const frameId = boothState.frameId || frames[0]!.id
const photos = boothState.photos

const activeFrame = ref(frames.find((frame) => frame.id === frameId) ?? frames[0]!)
const selectedFilter = ref(filters[0]!)
const activeStickerCategory = ref(stickerCategories[0]!)

type StickerItem = {
  id: number
  emoji: string
  x: number
  y: number
}

const placedStickers = ref<StickerItem[]>([])
const draggingId = ref<number | null>(null)


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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
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

async function downloadResult() {
  const preview = document.getElementById('preview-area')
  if (!preview) return

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = activeFrame.value.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.filter = selectedFilter.value.css

  for (let i = 0; i < photos.length && i < activeFrame.value.slots.length; i++) {
    const photo = photos[i]
    const slot = activeFrame.value.slots[i]
    if (!photo || !slot) continue

    const img = await loadImage(photo)

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 28)
    ctx.clip()
    drawCoverImage(ctx, img, slot.x, slot.y, slot.w, slot.h)
    ctx.restore()
  }

  ctx.filter = 'none'

  if (activeFrame.value.image) {
    const frameImg = await loadImage(activeFrame.value.image)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
  } else {
    ctx.fillStyle = activeFrame.value.accent
    ctx.font = 'bold 58px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Riell Booth', canvas.width / 2, 90)
    ctx.font = '34px Arial'
    ctx.fillText('capture your moments', canvas.width / 2, canvas.height - 70)
  }

  const scaleX = canvas.width / preview.clientWidth
  const scaleY = canvas.height / preview.clientHeight

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
    <section class="preview-wrap">
      <div class="preview-head">
        <p class="eyebrow center">final touch</p>
        <h1>Preview Result</h1>
        <p v-if="photos.length">Pilih filter, sticker, lalu download.</p>
        <p v-else>Belum ada foto. Balik ambil foto dulu.</p>
      </div>

      <div
  v-if="photos.length"
  id="preview-area"
  class="frame-canvas"
>
  <img v-if="photos[0]" :src="photos[0]" class="photo photo-1" />
  <img v-if="photos[1]" :src="photos[1]" class="photo photo-2" />
  <img v-if="photos[2]" :src="photos[2]" class="photo photo-3" />
  <img v-if="photos[3]" :src="photos[3]" class="photo photo-4" />
  <img v-if="photos[4]" :src="photos[4]" class="photo photo-5" />
  <img v-if="photos[5]" :src="photos[5]" class="photo photo-6" />

  <img
    src="/frames/test1.png"
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
        <button v-if="photos.length" class="riell-btn primary" @click="downloadResult">Download PNG</button>
        <button class="riell-btn soft" @click="router.push('/layout')">Retake</button>
      </div>
    </section>
  </main>
</template>
