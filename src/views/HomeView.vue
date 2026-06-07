<template>
  <main class="hero">
    <div class="hero-card">

      <p class="badge">✦ vintage mobile photobooth ✦</p>

      <h1>Riell Booth</h1>

      <p class="desc">
        Capture memories with vintage frames,
        stickers, filters & aesthetic layouts.
      </p>

      <button
        class="start-btn"
        @click="$router.push('/layout')"
      >
        📸 Start Booth
      </button>

      <div class="features">
        <span>🎞 Vintage Frame</span>
        <span>✨ Sticker</span>
        <span>🦋 Filter</span>
      </div>

    </div>
  </main>
</template>