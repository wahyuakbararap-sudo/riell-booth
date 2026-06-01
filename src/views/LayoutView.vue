<script setup lang="ts">
import { useRouter } from 'vue-router'
import { frames } from '../data/frames'

const router = useRouter()

function chooseFrame(id: string) {
  sessionStorage.setItem('riell-frame', id)
  router.push(`/session/${id}`)
}
</script>

<template>
  <main class="page frame-page">
    <section class="frame-wrap">
      <p class="eyebrow center">choose your vibe</p>
      <h1 class="page-title">Pick Your Frame</h1>
      <p class="page-subtitle">Frame bakal otomatis nentuin jumlah foto yang diambil.</p>

      <div class="frame-grid">
        <button
          v-for="frame in frames"
          :key="frame.id"
          class="frame-card"
          @click="chooseFrame(frame.id)"
        >
          <div class="frame-preview" :style="{ background: frame.bg }">
            <img v-if="frame.image" :src="frame.image" />
            <div v-else class="emoji-frame-preview">
              <span>📸</span>
              <span>✨</span>
              <span>🎀</span>
            </div>
          </div>

          <div class="frame-info">
            <h2>{{ frame.name }}</h2>
            <p>{{ frame.photoCount }} photos</p>
          </div>
        </button>
      </div>
    </section>
  </main>
</template>
