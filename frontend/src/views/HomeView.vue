<template>
  <!-- Monday prompt modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.shouldShowMondayPrompt"
        class="fixed inset-0 z-50 flex items-center justify-center px-5"
        style="background: rgba(0,0,0,0.55)"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm px-8 py-8 text-center">

          <!-- Icon -->
          <div class="text-6xl mb-4">🎒</div>

          <!-- Title -->
          <h2 class="text-2xl font-black text-gray-800 mb-2">C'est lundi !</h2>
          <p class="text-gray-500 font-semibold mb-1">Tu as passé ton test vendredi.</p>
          <p class="text-gray-500 mb-5">Est-ce que tu l'as réussi ?</p>

          <!-- Current & next stage info -->
          <div class="bg-indigo-50 rounded-2xl px-4 py-3 mb-6 text-sm">
            <p class="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">Niveau actuel</p>
            <p class="font-black text-indigo-700 text-base">{{ store.activeStage.name }}</p>
            <template v-if="store.nextStage">
              <p class="text-gray-400 text-xs mt-2">✅ Si oui → passage à</p>
              <p class="font-black text-green-600 text-base">{{ store.nextStage.name }}</p>
            </template>
            <template v-else>
              <p class="text-yellow-600 font-bold text-xs mt-2">🏆 Tu es déjà au niveau maximum !</p>
            </template>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col gap-3">
            <button
              v-if="store.nextStage"
              @click="onPassedTest"
              class="bg-green-500 active:scale-95 text-white text-xl font-black py-5 rounded-2xl shadow transition-all"
            >
              Oui, j'ai réussi ! 🎉
            </button>
            <button
              @click="onDismiss"
              class="font-black text-lg py-5 rounded-2xl transition-all active:scale-95"
              :class="store.nextStage
                ? 'bg-gray-100 text-gray-600'
                : 'bg-indigo-600 text-white shadow'"
            >
              {{ store.nextStage ? 'Pas encore 😅' : 'Super, continuons ! 💪' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <div class="flex flex-col items-center justify-center min-h-screen min-h-dvh px-5 py-10">

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="text-6xl mb-4">🧮</div>
      <h1 class="text-5xl font-black text-indigo-700 tracking-tight">MathChrono</h1>
      <p class="text-xl text-purple-500 font-semibold mt-2">2 minutes · 20 questions</p>
    </div>

    <!-- Stage + difficulty badge -->
    <div class="bg-white rounded-2xl shadow-md px-8 py-4 mb-6 text-center border-2 border-indigo-100 w-full">
      <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Niveau actuel</p>
      <p class="text-2xl font-black text-indigo-700">{{ store.activeStage.name }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ store.activeStage.description }}</p>
      <div class="mt-3 flex items-center justify-center gap-2">
        <span class="text-lg">{{ store.activeDifficulty.emoji }}</span>
        <span
          class="text-sm font-black px-3 py-0.5 rounded-full"
          :class="difficultyBadgeClass"
        >{{ store.activeDifficulty.label }}</span>
        <span class="text-xs text-gray-400">· {{ store.activeDifficulty.description }}</span>
      </div>
    </div>

    <!-- Weekly stats card -->
    <div class="bg-white rounded-2xl shadow-md w-full mb-6 border-2 border-purple-100 overflow-hidden">
      <div class="bg-purple-50 px-6 py-3 flex items-center justify-between">
        <p class="text-sm font-black text-purple-500 uppercase tracking-widest">Cette semaine</p>
        <span class="text-xs text-purple-300 font-semibold">↺ vendredi 17h</span>
      </div>

      <!-- Has results this week -->
      <div v-if="store.weekStats" class="grid grid-cols-3 divide-x divide-gray-100 px-0 py-4">
        <div class="text-center px-2">
          <p class="text-3xl font-black text-indigo-700">{{ store.weekStats.count }}</p>
          <p class="text-xs font-bold text-gray-400 mt-1">Quiz</p>
        </div>
        <div class="text-center px-2">
          <p class="text-3xl font-black text-yellow-500">{{ store.weekStats.best }}</p>
          <p class="text-xs font-bold text-gray-400 mt-1">Meilleur</p>
        </div>
        <div class="text-center px-2">
          <p class="text-3xl font-black text-green-600">{{ store.weekStats.avg }}</p>
          <p class="text-xs font-bold text-gray-400 mt-1">Moyenne</p>
        </div>
      </div>

      <!-- No results this week -->
      <div v-else class="px-6 py-5 text-center">
        <p class="text-gray-400 font-semibold text-sm">Aucun quiz cette semaine.</p>
        <p class="text-gray-300 text-xs mt-1">Lance-toi ! 💪</p>
      </div>

      <!-- Mini score bars for this week's quizzes -->
      <div v-if="store.weekResults.length > 0" class="px-6 pb-4 flex items-end gap-1.5 h-10 justify-center">
        <div
          v-for="r in [...store.weekResults].reverse()"
          :key="r.id"
          class="rounded-t flex-1 max-w-6 transition-all"
          :class="barColor(r.score, r.total)"
          :style="{ height: barHeight(r.score, r.total) }"
          :title="`${r.score}/20`"
        />
      </div>
    </div>

    <!-- Last week stats card -->
    <div v-if="store.lastWeekStats" class="bg-white rounded-2xl shadow-sm w-full mb-6 border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-2.5 flex items-center justify-between">
        <p class="text-sm font-black text-gray-400 uppercase tracking-widest">Semaine dernière</p>
      </div>
      <div class="grid grid-cols-3 divide-x divide-gray-100 py-3">
        <div class="text-center px-2">
          <p class="text-2xl font-black text-gray-500">{{ store.lastWeekStats.count }}</p>
          <p class="text-xs font-bold text-gray-300 mt-1">Quiz</p>
        </div>
        <div class="text-center px-2">
          <p class="text-2xl font-black text-yellow-400">{{ store.lastWeekStats.best }}</p>
          <p class="text-xs font-bold text-gray-300 mt-1">Meilleur</p>
        </div>
        <div class="text-center px-2">
          <p class="text-2xl font-black text-green-400">{{ store.lastWeekStats.avg }}</p>
          <p class="text-xs font-bold text-gray-300 mt-1">Moyenne</p>
        </div>
      </div>
      <!-- Mini score bars for last week -->
      <div class="px-6 pb-3 flex items-end gap-1.5 h-8 justify-center">
        <div
          v-for="r in [...store.lastWeekResults].reverse()"
          :key="r.id"
          class="rounded-t flex-1 max-w-6 opacity-50"
          :class="barColor(r.score, r.total)"
          :style="{ height: barHeight(r.score, r.total) }"
          :title="`${r.score}/20`"
        />
      </div>
    </div>

    <!-- Start button -->
    <button
      @click="startQuiz"
      class="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-3xl font-black px-16 py-6 rounded-3xl shadow-lg transition-all duration-150 select-none mb-10"
    >
      Commencer ! 🚀
    </button>

    <!-- spacer so nav stays near bottom -->
    <div class="flex-1 min-h-4" />

    <!-- Nav links -->
    <nav class="flex gap-8 text-lg font-semibold">
      <RouterLink
        to="/results"
        class="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
      >
        📊 Résultats
      </RouterLink>
      <RouterLink
        to="/settings"
        class="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        ⚙️ Paramètres
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { useRouter } from 'vue-router'

const store = useAppStore()
const router = useRouter()

function startQuiz() {
  router.push('/quiz')
}

function onPassedTest() {
  store.advanceStage()
  store.dismissMondayPrompt()
}

function onDismiss() {
  store.dismissMondayPrompt()
}

const difficultyBadgeClass = computed(() => {
  const id = store.difficultyId
  if (id === 'easy')   return 'bg-green-100 text-green-700'
  if (id === 'medium') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
})

function barHeight(score, total) {
  const pct = score / total
  return Math.max(8, Math.round(pct * 36)) + 'px'
}

function barColor(score, total) {
  const pct = score / total
  if (pct >= 0.9) return 'bg-green-400'
  if (pct >= 0.7) return 'bg-indigo-400'
  if (pct >= 0.5) return 'bg-yellow-400'
  return 'bg-red-400'
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .bg-white {
  transform: scale(0.9) translateY(16px);
}
.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(8px);
}
</style>
