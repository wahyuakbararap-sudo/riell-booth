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

      <div class="frame-count">
  <h3>🎞 3 Frames Available</h3>

  <div class="frame-list">
    <div class="frame-pill">👖 Jeans Pocket Polaroid</div>
    <div class="frame-pill">💜 Purple Cute Monster</div>
    <div class="frame-pill">📷 Vintage Red</div>
  </div>
</div>

      <div class="features">
        <span>🎞 Vintage Frame</span>
        <span>✨ Sticker</span>
        <span>🦋 Filter</span>
      </div>

    </div>
  </main>
</template>