<template>
  <div class="min-h-screen min-h-dvh px-5 py-10">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <RouterLink to="/" class="text-indigo-600 hover:text-indigo-800 font-bold text-lg">← Retour</RouterLink>
      <h1 class="text-3xl font-black text-indigo-700">⚙️ Paramètres</h1>
      <span class="w-16" />
    </div>

    <!-- Stage selector card -->
    <div class="bg-white rounded-3xl shadow-lg px-8 py-8 mb-6 border border-indigo-100">
      <h2 class="text-lg font-black text-gray-700 mb-1">Niveau actuel</h2>
      <p class="text-sm text-gray-400 mb-6">Choisis les exercices de la semaine à pratiquer.</p>

      <div class="flex flex-col gap-3">
        <button
          v-for="stage in STAGES"
          :key="stage.id"
          @click="selectedId = stage.id"
          class="flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left"
          :class="selectedId === stage.id
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-100 bg-gray-50 hover:border-indigo-200'"
        >
          <div>
            <p class="font-black text-gray-800">{{ stage.name }}</p>
            <p class="text-sm text-gray-500">{{ stage.description }}</p>
          </div>
          <div class="flex items-center gap-2 ml-4 shrink-0">
            <span
              v-for="op in stage.operations"
              :key="op"
              class="text-xs font-bold px-2 py-0.5 rounded-full"
              :class="op === 'multiplication' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'"
            >
              {{ op === 'multiplication' ? '×' : '÷' }}
            </span>
            <span v-if="selectedId === stage.id" class="text-indigo-500 text-xl">✓</span>
          </div>
        </button>
      </div>

      <!-- Difficulty selector -->
      <h2 class="text-lg font-black text-gray-700 mt-8 mb-1">Difficulté</h2>
      <p class="text-sm text-gray-400 mb-4">Ajuste le temps disponible pour chaque quiz.</p>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="diff in DIFFICULTIES"
          :key="diff.id"
          @click="selectedDifficulty = diff.id"
          class="flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all"
          :class="selectedDifficulty === diff.id
            ? difficultyActiveClass(diff.id)
            : 'border-gray-100 bg-gray-50 hover:border-gray-300'"
        >
          <span class="text-2xl mb-1">{{ diff.emoji }}</span>
          <span class="font-black text-sm text-gray-800">{{ diff.label }}</span>
          <span class="text-xs text-gray-400 mt-0.5 text-center leading-tight">{{ diff.description }}</span>
        </button>
      </div>

      <!-- Save button -->
      <button
        @click="saveSettings"
        class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xl font-black py-4 rounded-2xl shadow transition-all duration-150"
      >
        Enregistrer
      </button>

      <!-- Saved confirmation -->
      <transition name="fade">
        <p v-if="saved" class="text-center text-green-600 font-bold mt-4">✅ Enregistré !</p>
      </transition>
    </div>

    <!-- Info -->
    <div class="bg-indigo-50 rounded-2xl px-6 py-4 border border-indigo-100">
      <p class="text-sm font-semibold text-indigo-600">
        💡 Chaque quiz génère 20 questions aléatoires avec les nombres du niveau sélectionné.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { STAGES, DIFFICULTIES } from '../data/stages.js'

const store = useAppStore()

const selectedId = ref(store.activeStageId)
const selectedDifficulty = ref(store.difficultyId)
const saved = ref(false)

function difficultyActiveClass(id) {
  if (id === 'easy')   return 'border-green-400 bg-green-50'
  if (id === 'medium') return 'border-yellow-400 bg-yellow-50'
  if (id === 'hard')   return 'border-red-400 bg-red-50'
}

function saveSettings() {
  store.setActiveStage(selectedId.value)
  store.setDifficulty(selectedDifficulty.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
