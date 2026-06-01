<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { frames } from '../data/frames'

const route = useRoute()
const router = useRouter()

const videoRef = ref<HTMLVideoElement | null>(null)
const countdownText = ref('')
const photos = ref<string[]>([])
const isCapturing = ref(false)

const frameId = String(route.params.layout)
const activeFrame = computed(() => frames.find((frame) => frame.id === frameId) ?? frames[0]!)

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch (err) {
    console.error('Camera error:', err)
    alert('Kamera gagal dibuka. Coba izinkan kamera / pakai HTTPS.')
  }
}

async function countdown() {
  for (let i = 3; i > 0; i--) {
    countdownText.value = String(i)
    await new Promise((resolve) => setTimeout(resolve, 700))
  }

  countdownText.value = 'SNAP'
  await new Promise((resolve) => setTimeout(resolve, 350))
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

function goPreview() {
  sessionStorage.setItem('riell-frame', activeFrame.value.id)
  sessionStorage.setItem('riell-photos', JSON.stringify(photos.value))
  router.push('/preview')
}

async function startSession() {
  if (isCapturing.value) return

  isCapturing.value = true
  photos.value = []

  for (let i = 0; i < activeFrame.value.photoCount; i++) {
    await countdown()
    capturePhoto()
    await new Promise((resolve) => setTimeout(resolve, 450))
  }

  isCapturing.value = false
  goPreview()
}

function uploadPhotos(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  photos.value = []

  const files = Array.from(input.files).slice(0, activeFrame.value.photoCount)

  if (files.length === 0) return

  let loaded = 0

  files.forEach((file) => {
    const reader = new FileReader()

    reader.onload = () => {
      photos.value.push(String(reader.result))
      loaded++

      if (loaded === files.length) {
        goPreview()
      }
    }

    reader.readAsDataURL(file)
  })
}

onMounted(startCamera)
</script>

<template>
  <main class="page session-page">
    <section class="session-wrap">
      <div class="session-head">
        <p class="eyebrow">riell session</p>
        <h1>{{ activeFrame.name }}</h1>
        <p>{{ photos.length }}/{{ activeFrame.photoCount }} captured</p>
      </div>

      <div class="camera-card">
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="camera-video"
        />

        <div v-if="countdownText" class="countdown">
          {{ countdownText }}
        </div>
      </div>

      <div class="action-panel">
        <button class="riell-btn primary" :disabled="isCapturing" @click="startSession">
          {{ isCapturing ? 'Capturing...' : `Start ${activeFrame.photoCount} Photos` }}
        </button>

        <button
          v-if="photos.length >= activeFrame.photoCount"
          class="riell-btn primary"
          @click="goPreview"
        >
          Continue to Preview
        </button>

        <label class="riell-btn ghost">
          Upload Photos
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            @change="uploadPhotos"
          />
        </label>

        <button class="riell-btn soft" @click="router.push('/layout')">
          Change Frame
        </button>
      </div>
    </section>
  </main>
</template>
