<template>
  <div class="flex flex-col items-center justify-center min-h-screen min-h-dvh px-5 py-10 text-center">

    <!-- Emoji -->
    <div class="text-8xl mb-4 anim-item" style="--delay: 0s">
      <span :class="{ 'animate-bounce': pct === 1 }">{{ resultEmoji }}</span>
    </div>

    <!-- Heading -->
    <h1 class="text-4xl font-black mb-1 anim-item" :class="scoreColor" style="--delay: 0.08s">
      {{ encouragement }}
    </h1>
    <p class="text-base font-semibold mb-2 anim-item" :class="subMessageColor" style="--delay: 0.12s">
      {{ subMessage }}
    </p>
    <p class="text-gray-400 font-semibold text-sm mb-8 anim-item" style="--delay: 0.16s">
      {{ result.stageName }}
    </p>

    <!-- Score card -->
    <div class="bg-white rounded-3xl shadow-xl w-full px-8 py-8 mb-8 border-2 border-indigo-100 anim-item" style="--delay: 0.2s">
      <p class="leading-none">
        <span class="text-7xl font-black text-indigo-700">{{ displayScore }}</span>
        <span class="text-3xl text-gray-400 font-bold"> / {{ result.total }}</span>
      </p>
      <p class="text-gray-500 mt-3 font-semibold">
        ⏱ Temps utilisé : {{ formattedTime }}
      </p>
    </div>

    <!-- Answers breakdown -->
    <div class="w-full bg-white rounded-2xl shadow px-6 py-4 mb-8 text-left border border-gray-100 anim-item" style="--delay: 0.28s">
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
    <div class="flex flex-col gap-3 w-full anim-item" style="--delay: 0.36s">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore.js'
import confetti from 'canvas-confetti'

const store = useAppStore()
const router = useRouter()

const result = computed(() => store.results[0] ?? {
  score: 0, total: 20, timeUsedSeconds: 0, stageName: '', answers: [],
})

const pct = computed(() => result.value.score / result.value.total)

const formattedTime = computed(() => {
  const s = result.value.timeUsedSeconds ?? 0
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
})

const scoreColor = computed(() => {
  if (pct.value >= 0.9) return 'text-green-600'
  if (pct.value >= 0.7) return 'text-indigo-600'
  if (pct.value >= 0.5) return 'text-yellow-600'
  return 'text-orange-500'
})

const subMessageColor = computed(() => {
  if (pct.value >= 0.9) return 'text-green-400'
  if (pct.value >= 0.7) return 'text-indigo-400'
  if (pct.value >= 0.5) return 'text-yellow-500'
  return 'text-orange-400'
})

const resultEmoji = computed(() => {
  if (pct.value === 1)   return '🌟'
  if (pct.value >= 0.9)  return '🎉'
  if (pct.value >= 0.7)  return '👏'
  if (pct.value >= 0.5)  return '💪'
  return '🔥'
})

const encouragement = computed(() => {
  if (pct.value === 1)   return 'Score parfait !'
  if (pct.value >= 0.9)  return 'Excellent !'
  if (pct.value >= 0.7)  return 'Bien joué !'
  if (pct.value >= 0.5)  return 'Bon effort !'
  return 'Ne lâche pas !'
})

const subMessage = computed(() => {
  if (pct.value === 1)   return 'Tu maîtrises parfaitement ce niveau !'
  if (pct.value >= 0.9)  return 'Tu es vraiment très fort !'
  if (pct.value >= 0.7)  return 'Tu progresses à chaque quiz !'
  if (pct.value >= 0.5)  return 'Chaque essai te rend plus fort !'
  return 'La pratique paie toujours, tu vas y arriver !'
})

// Animated score counter
const displayScore = ref(0)

function countUp(target) {
  const duration = 900
  const start = performance.now()
  function tick(now) {
    const t = Math.min((now - start) / duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)
    displayScore.value = Math.round(eased * target)
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function fireConfetti(p) {
  if (p === 1) {
    // Perfect score — multi-burst cannon
    const opts = { origin: { y: 0.65 } }
    confetti({ ...opts, particleCount: 60,  spread: 26, startVelocity: 55 })
    confetti({ ...opts, particleCount: 50,  spread: 70 })
    confetti({ ...opts, particleCount: 80,  spread: 110, decay: 0.91, scalar: 0.8 })
    confetti({ ...opts, particleCount: 25,  spread: 130, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    // Side cannons after a short delay
    setTimeout(() => {
      confetti({ particleCount: 120, angle: 60,  spread: 60, origin: { x: 0,   y: 0.7 } })
      confetti({ particleCount: 120, angle: 120, spread: 60, origin: { x: 1,   y: 0.7 } })
    }, 350)
    setTimeout(() => {
      confetti({ particleCount: 80,  angle: 75,  spread: 45, origin: { x: 0.1, y: 0.5 } })
      confetti({ particleCount: 80,  angle: 105, spread: 45, origin: { x: 0.9, y: 0.5 } })
    }, 700)
  } else if (p >= 0.85) {
    confetti({ particleCount: 100, spread: 80,  origin: { y: 0.65 } })
  } else if (p >= 0.7) {
    confetti({ particleCount: 50,  spread: 60,  origin: { y: 0.65 } })
  }
  // < 70 %: no confetti — no need to celebrate a rough result
}

onMounted(() => {
  fireConfetti(pct.value)
  countUp(result.value.score)
})

function tryAgain() {
  router.push('/quiz')
}
</script>

<style scoped>
/* Staggered slide-up entrance */
.anim-item {
  animation: slide-up 0.4s ease-out both;
  animation-delay: var(--delay, 0s);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
