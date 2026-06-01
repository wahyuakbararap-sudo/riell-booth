<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stickers } from '../data/stickers'
import { frames } from '../data/frames'
import { filters } from '../data/filters'

const router = useRouter()

const layoutId = sessionStorage.getItem('riell-layout') || 'solo'
const photos = JSON.parse(sessionStorage.getItem('riell-photos') || '[]') as string[]

const activeFrame = ref(frames[0]!)
const selectedFilter = ref(filters[0]!)

type StickerItem = {
  id: number
  emoji: string
  x: number
  y: number
}

const placedStickers = ref<StickerItem[]>([])
const draggingId = ref<number | null>(null)
const isGrid = computed(() => layoutId === 'grid')

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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = src
  })
}

async function downloadResult() {
  const preview = document.getElementById('preview-area')
  if (!preview) return

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = layoutId === 'strip' ? 1920 : 1350

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = activeFrame.value.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = activeFrame.value.accent
  ctx.font = 'bold 56px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(activeFrame.value.title, canvas.width / 2, 90)

  ctx.font = '38px Arial'
  ctx.fillText(activeFrame.value.top, canvas.width / 2, 145)

  const slots =
    layoutId === 'solo'
      ? [{ x: 120, y: 190, w: 840, h: 1000 }]
      : layoutId === 'duo'
        ? [
            { x: 120, y: 190, w: 840, h: 480 },
            { x: 120, y: 710, w: 840, h: 480 },
          ]
        : layoutId === 'grid'
          ? [
              { x: 80, y: 190, w: 440, h: 500 },
              { x: 560, y: 190, w: 440, h: 500 },
              { x: 80, y: 730, w: 440, h: 500 },
              { x: 560, y: 730, w: 440, h: 500 },
            ]
          : [
              { x: 170, y: 190, w: 740, h: 360 },
              { x: 170, y: 590, w: 740, h: 360 },
              { x: 170, y: 990, w: 740, h: 360 },
              { x: 170, y: 1390, w: 740, h: 360 },
            ]

  ctx.filter = selectedFilter.value.css

  for (let i = 0; i < photos.length && i < slots.length; i++) {
    const photo = photos[i]
    const s = slots[i]
    if (!photo || !s) continue

    const img = await loadImage(photo)

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 10
    ctx.beginPath()
    ctx.roundRect(s.x, s.y, s.w, s.h, 32)
    ctx.clip()
    ctx.drawImage(img, s.x, s.y, s.w, s.h)
    ctx.restore()
  }

  ctx.filter = 'none'

  const scaleX = canvas.width / preview.clientWidth
  const scaleY = canvas.height / preview.clientHeight

  ctx.font = '70px Arial'
  ctx.textAlign = 'left'

  placedStickers.value.forEach((s) => {
    ctx.fillText(s.emoji, s.x * scaleX, (s.y + 60) * scaleY)
  })

  ctx.fillStyle = activeFrame.value.accent
  ctx.font = 'bold 34px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(activeFrame.value.bottom, canvas.width / 2, canvas.height - 110)

  ctx.fillStyle = '#6b7280'
  ctx.font = '26px Arial'
  ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 65)

  const link = document.createElement('a')
  link.download = 'riell-booth.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <main
    class="page"
    @mousemove="dragSticker"
    @mouseup="stopDrag"
    @touchmove="dragSticker"
    @touchend="stopDrag"
  >
    <section style="max-width: 430px; margin: 0 auto;">
      <h1 style="text-align: center;">Riell Booth Preview</h1>

      <div
        id="preview-area"
        class="card"
        :style="{
          position: 'relative',
          padding: '18px',
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: isGrid ? '1fr 1fr' : '1fr',
          background: activeFrame.bg,
          overflow: 'hidden',
        }"
      >
        <div style="grid-column: 1 / -1; text-align: center; font-weight: 900; font-size: 22px;">
          {{ activeFrame.title }}
        </div>

        <div style="grid-column: 1 / -1; text-align: center; font-size: 22px;">
          {{ activeFrame.top }}
        </div>

        <img
          v-for="photo in photos"
          :key="photo"
          :src="photo"
          :style="{
            width: '100%',
            borderRadius: '18px',
            objectFit: 'cover',
            filter: selectedFilter.css,
          }"
        />

        <div
          v-for="sticker in placedStickers"
          :key="sticker.id"
          :style="{
            position: 'absolute',
            left: sticker.x + 'px',
            top: sticker.y + 'px',
            fontSize: '48px',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
            zIndex: 99,
          }"
          @mousedown="startDrag(sticker.id)"
          @touchstart="startDrag(sticker.id)"
        >
          {{ sticker.emoji }}
        </div>

        <div style="grid-column: 1 / -1; text-align: center; font-weight: 800;">
          {{ activeFrame.bottom }}
        </div>
      </div>

      <div class="card" style="padding: 16px; margin-top: 16px;">
        <p style="font-weight: 800;">Sticker</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button
            v-for="sticker in stickers"
            :key="sticker"
            class="secondary-btn"
            style="padding: 10px 12px; font-size: 24px;"
            @click="addSticker(sticker)"
          >
            {{ sticker }}
          </button>
        </div>

        <p style="font-weight: 800; margin-top: 18px;">Frame</p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <button
            v-for="frame in frames"
            :key="frame.id"
            class="secondary-btn"
            :style="{
              background: activeFrame.id === frame.id ? frame.accent : 'white',
              color: activeFrame.id === frame.id ? 'white' : '#111827',
            }"
            @click="activeFrame = frame"
          >
            {{ frame.name }}
          </button>
        </div>

        <p style="font-weight: 800; margin-top: 18px;">Filter</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="secondary-btn"
            :style="{
              background: selectedFilter.id === filter.id ? '#ec4899' : 'white',
              color: selectedFilter.id === filter.id ? 'white' : '#111827',
            }"
            @click="selectedFilter = filter"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <div style="display: grid; gap: 12px; margin-top: 18px;">
        <button class="primary-btn" @click="downloadResult">Download PNG</button>
        <button class="secondary-btn" @click="router.push('/layout')">Retake</button>
      </div>
    </section>
  </main>
</template>