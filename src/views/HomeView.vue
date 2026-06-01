<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="page">
    <section class="card" style="max-width: 430px; margin: 0 auto; padding: 34px; text-align: center;">
      <p style="font-weight: 800; color: #ec4899;">📸 mobile photobooth</p>

      <h1 style="font-size: 44px; line-height: 1; margin: 10px 0;">
        Riell Booth
      </h1>

      <p style="opacity: .7; margin-bottom: 28px;">
        Capture your moments, keep your memories.
      </p>

      <button class="primary-btn" @click="router.push('/layout')">
        Start Booth
      </button>
    </section>
  </main>
</template>