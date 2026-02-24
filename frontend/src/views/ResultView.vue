<template>
  <div class="flex flex-col items-center justify-center min-h-screen min-h-dvh px-5 py-10 text-center">

    <!-- Emoji & heading -->
    <div class="text-8xl mb-4">{{ resultEmoji }}</div>
    <h1 class="text-4xl font-black mb-2" :class="scoreColor">{{ encouragement }}</h1>
    <p class="text-gray-500 font-semibold text-lg mb-8">{{ result.stageName }}</p>

    <!-- Score card -->
    <div class="bg-white rounded-3xl shadow-xl w-full px-8 py-8 mb-8 border-2 border-indigo-100">
      <p class="text-7xl font-black text-indigo-700 leading-none">
        {{ result.score }}<span class="text-3xl text-gray-400 font-bold"> / {{ result.total }}</span>
      </p>
      <p class="text-gray-500 mt-3 font-semibold">
        ⏱ Temps utilisé : {{ formattedTime }}
      </p>
    </div>

    <!-- Answers breakdown -->
    <div class="w-full bg-white rounded-2xl shadow px-6 py-4 mb-8 text-left border border-gray-100">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Réponses</p>
      <div class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        <div
          v-for="(a, i) in result.answers"
          :key="i"
          class="flex items-center justify-between text-base"
        >
          <span class="font-bold text-gray-700">{{ a.question }} = {{ a.correctAnswer }}</span>
          <span v-if="a.correct" class="text-green-500 font-bold">✅</span>
          <span v-else class="text-red-500 font-semibold">
            ❌ <span class="line-through text-gray-400">{{ a.userAnswer ?? '—' }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3 w-full">
      <button
        @click="tryAgain"
        class="bg-indigo-600 active:scale-95 text-white text-xl font-black py-5 rounded-2xl shadow transition-all duration-150"
      >
        Recommencer ! 🔁
      </button>
      <RouterLink
        to="/"
        class="text-center bg-white border-2 border-gray-200 text-gray-700 text-lg font-bold py-5 rounded-2xl shadow transition-all active:scale-95"
      >
        🏠 Accueil
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore.js'

const store = useAppStore()
const router = useRouter()

// Last saved result
const result = computed(() => store.results[0] ?? {
  score: 0, total: 20, timeUsedSeconds: 0, stageName: '', answers: [],
})

const formattedTime = computed(() => {
  const s = result.value.timeUsedSeconds ?? 0
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
})

const scoreColor = computed(() => {
  const pct = result.value.score / result.value.total
  if (pct >= 0.9) return 'text-green-600'
  if (pct >= 0.7) return 'text-indigo-600'
  if (pct >= 0.5) return 'text-yellow-600'
  return 'text-red-500'
})

const resultEmoji = computed(() => {
  const pct = result.value.score / result.value.total
  if (pct === 1)   return '🌟'
  if (pct >= 0.9)  return '🎉'
  if (pct >= 0.7)  return '👍'
  if (pct >= 0.5)  return '💪'
  return '🤔'
})

const encouragement = computed(() => {
  const pct = result.value.score / result.value.total
  if (pct === 1)   return 'Score parfait !'
  if (pct >= 0.9)  return 'Excellent !'
  if (pct >= 0.7)  return 'Bien joué !'
  if (pct >= 0.5)  return 'Continue !'
  return "L'entraînement paie !"
})

function tryAgain() {
  router.push('/quiz')
}
</script>
