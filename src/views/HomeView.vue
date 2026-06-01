<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="home-vintage">
    <div class="floating-deco deco-1">✦</div>
    <div class="floating-deco deco-2">♡</div>
    <div class="floating-deco deco-3">📷</div>

    <section class="hero-card">
      <p class="eyebrow">vintage mobile photobooth</p>

      <h1>Riell Booth</h1>

      <p class="subtitle">
        Take cute photo strips, add frames, stickers, filters, and save your memory.
      </p>

      <div class="mini-strip">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <button class="start-btn" @click="router.push('/layout')">
        Start Booth
      </button>

      <p class="footer-note">made for sweet little moments ✨</p>
    </section>
  </main>
</template>