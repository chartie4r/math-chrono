<template>
  <div class="min-h-screen min-h-dvh px-5 py-10">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <RouterLink to="/" class="text-indigo-600 hover:text-indigo-800 font-bold text-lg">← Retour</RouterLink>
      <h1 class="text-3xl font-black text-indigo-700">📊 Résultats</h1>
      <button
        v-if="store.results.length > 0"
        @click="confirmClear"
        class="text-sm text-red-400 hover:text-red-600 font-semibold transition-colors"
      >
        Tout effacer
      </button>
      <span v-else class="w-16" />
    </div>

    <!-- Empty state -->
    <div v-if="store.results.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">🏁</div>
      <p class="text-xl font-bold text-gray-500">Aucun quiz pour l'instant !</p>
      <p class="text-gray-400 mt-2">Complète ton premier quiz pour voir tes résultats ici.</p>
      <RouterLink
        to="/"
        class="inline-block mt-6 bg-indigo-600 text-white font-black text-lg px-8 py-3 rounded-2xl shadow hover:bg-indigo-700 transition-colors"
      >
        Commencer un quiz 🚀
      </RouterLink>
    </div>

    <!-- Stats summary -->
    <div v-else>
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white rounded-2xl shadow p-4 text-center border border-indigo-50">
          <p class="text-2xl font-black text-indigo-700">{{ store.results.length }}</p>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Quiz</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center border border-yellow-50">
          <p class="text-2xl font-black text-yellow-600">{{ store.bestScore }}</p>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Meilleur</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center border border-green-50">
          <p class="text-2xl font-black text-green-600">{{ averageScore }}</p>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Moyenne</p>
        </div>
      </div>

      <!-- Results list -->
      <div class="flex flex-col gap-3">
        <div
          v-for="r in store.results"
          :key="r.id"
          class="bg-white rounded-2xl shadow px-5 py-4 border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p class="font-black text-gray-800 text-base flex items-center gap-1.5">
              {{ r.stageName }}
              <span v-if="r.difficultyEmoji" class="text-sm" :title="r.difficultyLabel">{{ r.difficultyEmoji }}</span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(r.completedAt) }}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-400 font-semibold">⏱ {{ formatTime(r.timeUsedSeconds) }}</span>
            <span
              class="text-2xl font-black tabular-nums"
              :class="scoreClass(r.score, r.total)"
            >
              {{ r.score }}<span class="text-sm text-gray-400 font-bold">/{{ r.total }}</span>
            </span>
            <span class="text-xl">{{ scoreEmoji(r.score, r.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/appStore.js'

const store = useAppStore()

const averageScore = computed(() => {
  if (store.results.length === 0) return 0
  const sum = store.results.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / store.results.length)
})

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function scoreClass(score, total) {
  const pct = score / total
  if (pct >= 0.9) return 'text-green-600'
  if (pct >= 0.7) return 'text-indigo-600'
  if (pct >= 0.5) return 'text-yellow-600'
  return 'text-red-500'
}

function scoreEmoji(score, total) {
  const pct = score / total
  if (pct === 1)  return '🌟'
  if (pct >= 0.9) return '🎉'
  if (pct >= 0.7) return '👍'
  if (pct >= 0.5) return '💪'
  return '🤔'
}

function confirmClear() {
  if (window.confirm('Supprimer tout l\'historique ? Cette action est irréversible.')) {
    store.clearResults()
  }
}
</script>
