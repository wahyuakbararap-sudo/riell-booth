<script setup lang="ts">
import { useRouter } from 'vue-router'
import { layouts } from '../data/layouts'

const router = useRouter()

function chooseLayout(id: string) {
  router.push(`/session/${id}`)
}
</script>

<template>
  <main class="page">
    <section style="max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 34px; margin-bottom: 6px;">Choose Layout</h1>
      <p style="opacity: .7;">Pilih gaya foto buat sesi Riell Booth.</p>

      <div style="display: grid; gap: 14px; margin-top: 22px;">
        <button
          v-for="layout in layouts"
          :key="layout.id"
          class="card"
          style="padding: 22px; text-align: left; border: 0; cursor: pointer;"
          @click="chooseLayout(layout.id)"
        >
          <h2 style="margin: 0;">{{ layout.name }}</h2>
          <p style="opacity: .7; margin-bottom: 0;">{{ layout.description }}</p>
        </button>
      </div>
    </section>
  </main>
</template>