<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { frames } from '../data/frames'

const route = useRoute()
const router = useRouter()

const videoRef = ref<HTMLVideoElement | null>(null)
const countdownText = ref('')
const photos = ref<string[]>([])
const isCapturing = ref(false)
const cameraError = ref('')
const flash = ref(false)

const frameId = String(route.params.layout || sessionStorage.getItem('riell-frame') || '')
const activeFrame = computed(() => frames.find((frame) => frame.id === frameId) ?? frames[0]!)

function triggerFlash() {
  flash.value = true
  setTimeout(() => {
    flash.value = false
  }, 160)
}

async function startCamera() {
  try {
    cameraError.value = ''

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
  } catch {
    cameraError.value = 'Kamera gagal dibuka. Izinkan kamera dulu / pakai HTTPS.'
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

  const videoRatio = video.videoWidth / video.videoHeight
  const canvasRatio = canvas.width / canvas.height

  let sx = 0
  let sy = 0
  let sw = video.videoWidth
  let sh = video.videoHeight

  if (videoRatio > canvasRatio) {
    sw = video.videoHeight * canvasRatio
    sx = (video.videoWidth - sw) / 2
  } else {
    sh = video.videoWidth / canvasRatio
    sy = (video.videoHeight - sh) / 2
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  const image = canvas.toDataURL('image/png')
  const retakeIndex = sessionStorage.getItem('riell-retake-index')

  if (retakeIndex !== null) {
    const savedPhotos = JSON.parse(sessionStorage.getItem('riell-photos') || '[]') as string[]
    savedPhotos[Number(retakeIndex)] = image

    photos.value = savedPhotos

    sessionStorage.removeItem('riell-retake-index')
    sessionStorage.setItem('riell-frame', activeFrame.value.id)
    sessionStorage.setItem('riell-photos', JSON.stringify(savedPhotos))

    goPreview()
    return
  }

  photos.value.push(image)
}

async function goPreview() {
  sessionStorage.setItem('riell-frame', activeFrame.value.id)
  sessionStorage.setItem('riell-photos', JSON.stringify(photos.value))

  try {
    await router.replace({ name: 'preview' })
  } catch {
    window.location.hash = '#/preview'
  }
}

async function startSession() {
  if (isCapturing.value) return

  const retakeIndex = sessionStorage.getItem('riell-retake-index')

  if (retakeIndex !== null) {
    isCapturing.value = true
    await countdown()
    triggerFlash()
    capturePhoto()
    isCapturing.value = false
    return
  }

  isCapturing.value = true
  photos.value = []

  for (let i = 0; i < activeFrame.value.photoCount; i++) {
    await countdown()
    triggerFlash()
    capturePhoto()
    await new Promise((resolve) => setTimeout(resolve, 450))
  }

  isCapturing.value = false

  // Delay kecil biar UI sempet update 6/6, lalu auto next
  await new Promise((resolve) => setTimeout(resolve, 300))
  await goPreview()
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
        ></video>

        <div v-if="flash" class="camera-flash"></div>

        <div v-if="countdownText" class="countdown">
          {{ countdownText }}
        </div>
      </div>

      <p v-if="cameraError" class="error-box">
        {{ cameraError }}
      </p>

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
