<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { layouts } from '../data/layouts'

const route = useRoute()
const router = useRouter()

const videoRef = ref<HTMLVideoElement | null>(null)
const countdownText = ref('')
const photos = ref<string[]>([])

const layoutId = String(route.params.layout)
const selectedLayout = layouts.find((l) => l.id === layoutId) ?? layouts[0]!

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  })

  if (videoRef.value) videoRef.value.srcObject = stream
}

async function countdown() {
  for (let i = 3; i > 0; i--) {
    countdownText.value = String(i)
    await new Promise((r) => setTimeout(r, 700))
  }

  countdownText.value = 'SNAP'
  await new Promise((r) => setTimeout(r, 350))
  countdownText.value = ''
}

function capturePhoto() {
  const video = videoRef.value
  if (!video) return

  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1200

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.save()
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  photos.value.push(canvas.toDataURL('image/png'))
}

async function startSession() {
  photos.value = []

  for (let i = 0; i < selectedLayout.photoCount; i++) {
    await countdown()
    capturePhoto()
    await new Promise((r) => setTimeout(r, 500))
  }

  sessionStorage.setItem('riell-layout', selectedLayout.id)
  sessionStorage.setItem('riell-photos', JSON.stringify(photos.value))

  router.push('/preview')
}

onMounted(startCamera)
</script>

<template>
  <main class="page">
    <section style="max-width: 430px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 16px;">
        <h1 style="margin-bottom: 4px;">{{ selectedLayout.name }}</h1>
        <p style="opacity: .7;">{{ photos.length }}/{{ selectedLayout.photoCount }} captured</p>
      </div>

      <div class="card" style="position: relative; overflow: hidden; aspect-ratio: 3/4;">
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
        />

        <div
          v-if="countdownText"
          style="position: absolute; inset: 0; display: grid; place-items: center; color: white; font-size: 70px; font-weight: 900; text-shadow: 0 6px 30px #000;"
        >
          {{ countdownText }}
        </div>
      </div>

      <div style="display: grid; gap: 12px; margin-top: 18px;">
        <button class="primary-btn" @click="startSession">Start Photo</button>
        <button class="secondary-btn" @click="router.push('/layout')">Change Layout</button>
      </div>
    </section>
  </main>
</template>