<template>
  <div class="flex flex-col min-h-dvh px-4 pt-6 pb-6 md:px-8 md:pt-8 md:pb-8 w-full mx-auto">

    <!-- ── Top bar ── -->
    <div class="w-full mb-3 md:mb-4">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-sm md:text-base font-bold text-gray-500">
          Question <span class="text-indigo-600">{{ currentIndex + 1 }}</span> / {{ questions.length }}
        </span>
        <div class="flex items-center gap-3 md:gap-4">
          <span
            class="text-xl md:text-2xl font-black tabular-nums transition-colors"
            :class="timeLeft <= warningThreshold ? 'text-red-500 animate-pulse' : 'text-indigo-600'"
          >
            ⏱ {{ formattedTime }}
          </span>
          <button
            @click="openQuitConfirm"
            class="text-sm md:text-base font-semibold text-red-600 bg-red-50 border border-red-300 rounded-xl py-2 px-4 md:py-2.5 md:px-5 min-h-[44px] flex items-center justify-center shrink-0 shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors select-none"
            aria-label="Quitter le quiz"
          >
            Quitter
          </button>
        </div>
      </div>

      <!-- Timer bar -->
      <div class="w-full h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-3 md:h-4 rounded-full transition-all duration-1000"
          :class="timeLeft <= warningThreshold ? 'bg-red-400' : 'bg-indigo-500'"
          :style="{ width: timerPercent + '%' }"
        />
      </div>

      <!-- Progress dots (no correct/incorrect state) -->
      <div class="flex gap-1 md:gap-2 mt-2 flex-wrap justify-center">
        <div
          v-for="(_, i) in questions"
          :key="i"
          class="w-3 h-3 md:w-4 md:h-4 rounded-full transition-colors"
          :class="{
            'bg-indigo-600 scale-125': i === currentIndex,
            'bg-indigo-400': i < currentIndex,
            'bg-gray-200':  i > currentIndex,
          }"
        />
      </div>
    </div>

    <!-- ── Question card ── -->
    <div
      class="flex-1 flex flex-col items-center justify-center w-full rounded-3xl shadow-xl border-2 border-transparent bg-white transition-all duration-200 py-6 px-6 md:py-10 md:px-10 mb-4 md:mb-6 min-h-0"
      :class="cardAnimClass"
      @animationend="cardAnimClass = ''"
    >
      <p class="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 md:mb-4">
        {{ store.activeStage.name }} · {{ store.activeDifficulty.emoji }} {{ store.activeDifficulty.label }}
      </p>

      <!-- Question (hidden when quit modal is open to avoid giving extra time) -->
      <p class="font-black text-gray-800 leading-none text-center mb-6 md:mb-8 quiz-question-text"
         style="font-size: clamp(2.5rem, 10vw, 5rem)">
        {{ showQuitConfirm ? '?' : currentQuestion?.text }} =
      </p>

      <!-- Answer display (hidden when quit modal is open) -->
      <div
        class="flex items-center justify-center rounded-2xl border-4 px-8 min-w-28 h-20 md:min-w-36 md:h-24 md:px-10 transition-all"
        :class="[
          typedAnswer && !showQuitConfirm ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-300 bg-white',
          answerAnimClass,
        ]"
        @animationend="answerAnimClass = ''"
      >
        <span
          class="font-black tabular-nums transition-all quiz-answer-text"
          style="font-size: clamp(2rem, 8vw, 3.5rem)"
          :class="(typedAnswer && !showQuitConfirm) ? 'text-indigo-700' : 'text-gray-300'"
        >
          {{ showQuitConfirm ? '?' : (typedAnswer || '?') }}
        </span>
      </div>

    </div>

    <!-- Numpad (disabled when quit modal is open) -->
    <div class="w-full grid grid-cols-3 gap-3 md:gap-4 mb-1">
      <button
        v-for="key in numpadKeys"
        :key="key.label"
        @click="handleKey(key)"
        :disabled="showFeedback || showQuitConfirm || (key.action === 'submit' && !typedAnswer)"
        class="select-none rounded-2xl font-black transition-all active:scale-90 flex items-center justify-center"
        :class="[key.style, numpadHeight]"
      >
        <span :class="key.textSize">{{ key.label }}</span>
      </button>
    </div>

    <!-- Quit confirmation modal (pauses quiz, hides calculation) -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showQuitConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="cancelQuit"
        >
          <div
            class="modal-box bg-white rounded-2xl shadow-xl max-w-sm md:max-w-md w-full p-6 md:p-8 text-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quit-modal-title"
            @click.stop
          >
            <h2 id="quit-modal-title" class="text-lg md:text-xl font-bold text-gray-800 mb-2">
              Quitter le quiz ?
            </h2>
            <p class="text-gray-600 mb-6 md:mb-8 md:text-lg">
              Ta progression sera perdue. Tu es sûr ?
            </p>
            <div class="flex gap-3 md:gap-4">
              <button
                @click="cancelQuit"
                class="flex-1 py-3 px-4 md:py-4 md:px-5 rounded-xl font-semibold md:text-lg bg-gray-100 text-gray-700 active:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="confirmQuit"
                class="flex-1 py-3 px-4 md:py-4 md:px-5 rounded-xl font-semibold md:text-lg bg-red-500 text-white active:bg-red-600 transition-colors"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
const cardAnimClass = ref('')    // 'anim-shake' on wrong
const answerAnimClass = ref('')  // 'anim-bounce' on correct
const showQuitConfirm = ref(false)

let timerInterval = null

const currentQuestion = computed(() => questions.value[currentIndex.value])
const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
const timerPercent = computed(() => (timeLeft.value / TOTAL_SECONDS) * 100)
const warningThreshold = Math.round(TOTAL_SECONDS * 0.15)

// Numpad layout — rows: 7 8 9 / 4 5 6 / 1 2 3 / ⌫ 0 ✓ (text sizes responsive for iPad)
const numpadKeys = [
  { label: '7', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '8', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '9', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '4', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '5', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '6', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '1', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '2', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '3', action: 'digit', style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '⌫',  action: 'backspace', style: 'bg-gray-100 shadow border border-gray-200 text-gray-500 active:bg-gray-200', textSize: 'text-2xl md:text-3xl' },
  { label: '0', action: 'digit',     style: 'bg-white shadow border border-gray-200 text-gray-800 active:bg-gray-100', textSize: 'text-3xl md:text-4xl' },
  { label: '✓',  action: 'submit',   style: 'bg-green-500 shadow-md text-white disabled:bg-gray-300 disabled:shadow-none active:bg-green-600', textSize: 'text-3xl md:text-4xl' },
]

// Taller buttons on tablet (iPad Air 11"/13") — big touch targets for kids
const numpadHeight = 'h-14 sm:h-20 md:h-24 min-h-[52px]'

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
  if (showFeedback.value || showQuitConfirm.value) return
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
  showFeedback.value = true
  // Trigger animation
  if (correct) {
    answerAnimClass.value = 'anim-bounce'
  } else {
    cardAnimClass.value = 'anim-shake'
  }

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
  timerInterval = null
  router.push('/')
}

function openQuitConfirm() {
  showQuitConfirm.value = true
  clearInterval(timerInterval)
  timerInterval = null
}

function cancelQuit() {
  showQuitConfirm.value = false
  if (timerInterval === null) {
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
  }
}

function confirmQuit() {
  quitQuiz()
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
/* iPad and up: larger question/answer text to fill the viewport */
@media (min-width: 768px) {
  .quiz-question-text {
    font-size: clamp(3rem, 8vw, 6rem);
  }
  .quiz-answer-text {
    font-size: clamp(2.5rem, 6vw, 4rem);
  }
}

/* Modal overlay */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
}

/* Wrong answer — card shakes side-to-side */
.anim-shake {
  animation: shake 0.45s ease-in-out;
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  15%     { transform: translateX(-10px); }
  30%     { transform: translateX(10px); }
  45%     { transform: translateX(-7px); }
  60%     { transform: translateX(7px); }
  75%     { transform: translateX(-4px); }
  90%     { transform: translateX(4px); }
}

/* Correct answer — answer box bounces */
.anim-bounce {
  animation: bounce-answer 0.5s ease-out;
}
@keyframes bounce-answer {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.25); }
  55%  { transform: scale(0.92); }
  75%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
</style>
