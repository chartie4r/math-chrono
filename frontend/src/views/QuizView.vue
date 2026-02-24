<template>
  <div class="flex flex-col min-h-screen min-h-dvh px-3 pt-6 pb-4 max-w-lg mx-auto">

    <!-- ── Top bar ── -->
    <div class="w-full mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-bold text-gray-500">
          Question <span class="text-indigo-600">{{ currentIndex + 1 }}</span> / {{ questions.length }}
        </span>
        <span
          class="text-xl font-black tabular-nums transition-colors"
          :class="timeLeft <= warningThreshold ? 'text-red-500 animate-pulse' : 'text-indigo-600'"
        >
          ⏱ {{ formattedTime }}
        </span>
      </div>

      <!-- Timer bar -->
      <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-3 rounded-full transition-all duration-1000"
          :class="timeLeft <= warningThreshold ? 'bg-red-400' : 'bg-indigo-500'"
          :style="{ width: timerPercent + '%' }"
        />
      </div>

      <!-- Progress dots -->
      <div class="flex gap-1 mt-2 flex-wrap justify-center">
        <div
          v-for="(_, i) in questions"
          :key="i"
          class="w-3 h-3 rounded-full transition-colors"
          :class="{
            'bg-indigo-600 scale-125': i === currentIndex,
            'bg-green-400': i < currentIndex && answers[i]?.correct,
            'bg-red-400':   i < currentIndex && !answers[i]?.correct,
            'bg-gray-200':  i > currentIndex,
          }"
        />
      </div>
    </div>

    <!-- ── Question card ── -->
    <div
      class="flex-1 flex flex-col items-center justify-center w-full rounded-3xl shadow-xl border-2 transition-all duration-200 py-6 px-6 mb-4 min-h-0"
      :class="feedbackClass"
    >
      <p class="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">
        {{ store.activeStage.name }} · {{ store.activeDifficulty.emoji }} {{ store.activeDifficulty.label }}
      </p>

      <!-- Question -->
      <p class="font-black text-gray-800 leading-none text-center mb-6"
         style="font-size: clamp(2.5rem, 10vw, 5rem)">
        {{ currentQuestion?.text }} =
      </p>

      <!-- Answer display -->
      <div
        class="flex items-center justify-center rounded-2xl border-4 px-8 min-w-28 h-20 transition-all"
        :class="typedAnswer
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-dashed border-gray-300 bg-white'"
      >
        <span
          class="font-black tabular-nums transition-all"
          style="font-size: clamp(2rem, 8vw, 3.5rem)"
          :class="typedAnswer ? 'text-indigo-700' : 'text-gray-300'"
        >
          {{ typedAnswer || '?' }}
        </span>
      </div>

      <!-- Feedback -->
      <transition name="pop">
        <div v-if="showFeedback" class="mt-4 text-center">
          <p v-if="lastCorrect" class="text-2xl font-black text-green-500">✅ Correct !</p>
          <p v-else class="text-xl font-black text-red-500">
            ❌ La réponse était <span class="text-2xl">{{ currentQuestion?.answer }}</span>
          </p>
        </div>
      </transition>
    </div>

    <!-- ── Numpad ── -->
    <div class="w-full grid grid-cols-3 gap-2 mb-2">
      <button
        v-for="key in numpadKeys"
        :key="key.label"
        @click="handleKey(key)"
        :disabled="showFeedback || (key.action === 'submit' && !typedAnswer)"
        class="select-none rounded-2xl font-black transition-all active:scale-90 flex items-center justify-center"
        :class="[key.style, numpadHeight]"
      >
        <span :class="key.textSize">{{ key.label }}</span>
      </button>
    </div>

    <!-- Quit -->
    <button
      @click="quitQuiz"
      class="w-full py-2 text-sm font-semibold text-gray-400 active:text-gray-600 transition-colors select-none"
    >
      Quitter le quiz
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore.js'
import { generateQuestions } from '../data/stages.js'

const TOTAL_SECONDS = 120
const FEEDBACK_DELAY = 700

const store = useAppStore()
const router = useRouter()

const questions = ref(generateQuestions(store.activeStage, store.activeDifficulty))
const currentIndex = ref(0)
const answers = ref([])
const typedAnswer = ref('')   // string built digit by digit
const timeLeft = ref(TOTAL_SECONDS)
const showFeedback = ref(false)
const lastCorrect = ref(false)

let timerInterval = null

const currentQuestion = computed(() => questions.value[currentIndex.value])
const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
const timerPercent = computed(() => (timeLeft.value / TOTAL_SECONDS) * 100)
const warningThreshold = Math.round(TOTAL_SECONDS * 0.15)

const feedbackClass = computed(() => {
  if (!showFeedback.value) return 'border-transparent bg-white'
  return lastCorrect.value ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
})

// Numpad layout — rows: 7 8 9 / 4 5 6 / 1 2 3 / ⌫ 0 ✓
const numpadKeys = [
  { label: '7', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '8', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '9', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '4', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '5', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '6', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '1', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '2', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '3', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '⌫',  action: 'backspace', style: 'bg-gray-100 shadow border border-gray-200 text-gray-500 active:bg-gray-200', textSize: 'text-2xl' },
  { label: '0', action: 'digit',     style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl' },
  { label: '✓',  action: 'submit',   style: 'bg-green-500 shadow-md text-white disabled:bg-gray-300 disabled:shadow-none active:bg-green-600', textSize: 'text-3xl' },
]

// Taller buttons on larger screens (iPad)
const numpadHeight = 'h-16 sm:h-20'

function handleKey(key) {
  if (showFeedback.value) return
  if (key.action === 'digit') {
    if (typedAnswer.value.length < 3) typedAnswer.value += key.label
  } else if (key.action === 'backspace') {
    typedAnswer.value = typedAnswer.value.slice(0, -1)
  } else if (key.action === 'submit') {
    submitAnswer()
  }
}

// Physical keyboard support (desktop / iPad external keyboard)
function handleKeydown(e) {
  if (showFeedback.value) return
  if (e.key >= '0' && e.key <= '9') {
    if (typedAnswer.value.length < 3) typedAnswer.value += e.key
  } else if (e.key === 'Backspace') {
    typedAnswer.value = typedAnswer.value.slice(0, -1)
  } else if (e.key === 'Enter' && typedAnswer.value) {
    submitAnswer()
  }
}

async function submitAnswer() {
  if (!typedAnswer.value || showFeedback.value) return

  const userNum = Number(typedAnswer.value)
  const correct = userNum === currentQuestion.value.answer
  lastCorrect.value = correct
  showFeedback.value = true

  answers.value.push({
    question: currentQuestion.value.text,
    userAnswer: userNum,
    correctAnswer: currentQuestion.value.answer,
    correct,
  })

  await new Promise((r) => setTimeout(r, FEEDBACK_DELAY))

  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    typedAnswer.value = ''
    showFeedback.value = false
  } else {
    finishQuiz()
  }
}

function finishQuiz() {
  clearInterval(timerInterval)
  const score = answers.value.filter((a) => a.correct).length
  store.saveResult({
    score,
    total: questions.value.length,
    timeUsedSeconds: TOTAL_SECONDS - timeLeft.value,
    answers: answers.value,
  })
  router.push('/result')
}

function quitQuiz() {
  clearInterval(timerInterval)
  router.push('/')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      while (answers.value.length < questions.value.length) {
        const q = questions.value[answers.value.length]
        answers.value.push({ question: q.text, userAnswer: null, correctAnswer: q.answer, correct: false })
      }
      finishQuiz()
    }
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  clearInterval(timerInterval)
})
</script>

<style scoped>
.pop-enter-active { animation: pop-in 0.2s ease-out; }
.pop-leave-active { animation: pop-in 0.15s ease-in reverse; }
@keyframes pop-in {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
</style>
