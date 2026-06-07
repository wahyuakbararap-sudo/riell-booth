<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { frames } from '../data/frames'
import { saveBoothSession } from '../stores/boothStore'

const route = useRoute()
const router = useRouter()

const videoRef = ref<HTMLVideoElement | null>(null)
const countdownText = ref('')
const photos = ref<string[]>([])
const isCapturing = ref(false)
const flash = ref(false)

function triggerFlash() {
  flash.value = true
  setTimeout(() => {
    flash.value = false
  }, 160)
}
const cameraError = ref('')

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
    cameraError.value = 'Kamera gagal dibuka. Coba izinkan kamera atau pakai HTTPS.'
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
  canvas.width = 720
  canvas.height = 960

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  photos.value.push(canvas.toDataURL('image/jpeg', 0.82))
}

async function goPreview() {
  saveBoothSession(activeFrame.value.id, photos.value)
  await router.push('/preview')
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

    reader.onload = async () => {
      photos.value.push(String(reader.result))
      loaded++

      if (loaded === files.length) {
        await goPreview()
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

      <div class="action-panel">
        <button class="riell-btn primary" :disabled="isCapturing" @click="startSession">
          {{ isCapturing ? 'Capturing...' : `Start ${activeFrame.photoCount} Photos` }}
        </button>

        <button
          v-if="photos.length > 0"
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

const flash = ref(false)

function triggerFlash() {
  flash.value = true
  setTimeout(() => {
    flash.value = false
  }, 160)
}