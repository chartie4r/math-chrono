<template>
  <div class="flex flex-col min-h-dvh px-4 pt-6 pb-6 md:px-8 md:pt-8 md:pb-8 w-full mx-auto">

    <!-- ── Top bar ── -->
    <div class="w-full mb-3 md:mb-4">
      <div class="flex items-center justify-end gap-2 mb-2">
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
          <button
            v-if="allQuestionsAnswered && !showQuitConfirm && !showEndConfirm"
            @click="openEndConfirm"
            class="text-sm md:text-base font-semibold text-white bg-green-500 border border-green-600 rounded-xl py-2 px-4 md:py-2.5 md:px-5 min-h-[44px] flex items-center justify-center shrink-0 shadow-sm hover:bg-green-600 active:bg-green-700 transition-colors select-none"
            aria-label="Terminer le quiz"
          >
            Terminer
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

      <!-- Progress dots: current = bigger; past skipped = yellow; past answered = blue; future = gray -->
      <div class="flex gap-1 md:gap-2 mt-2 flex-wrap justify-center items-center">
        <div
          v-for="idx in questions.length"
          :key="idx"
          class="rounded-full transition-all duration-200 shrink-0"
          :class="[
            idx - 1 === currentStepIndex ? 'w-5! h-5! md:w-7! md:h-7!' : 'w-3 h-3 md:w-4 md:h-4',
            (idx - 1 === currentStepIndex || ((idx - 1 < currentStepIndex) || (isDeferredPhase && idx - 1 !== currentStepIndex))) && skippedStepIndices.includes(idx - 1) && !answeredDeferredSteps.includes(idx - 1) ? 'bg-amber-400' : '',
            idx - 1 === currentStepIndex && (!skippedStepIndices.includes(idx - 1) || answeredDeferredSteps.includes(idx - 1)) ? 'bg-indigo-600' : '',
            ((idx - 1 < currentStepIndex) || (isDeferredPhase && idx - 1 !== currentStepIndex)) && (!skippedStepIndices.includes(idx - 1) || answeredDeferredSteps.includes(idx - 1)) ? 'bg-indigo-400' : '',
            idx - 1 > currentStepIndex && !isDeferredPhase ? 'bg-gray-200' : '',
          ]"
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
        :class="typedAnswer && !showQuitConfirm ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-300 bg-white'"
      >
        <span
          class="font-black tabular-nums transition-all quiz-answer-text"
          style="font-size: clamp(2rem, 8vw, 3.5rem)"
          :class="(typedAnswer && !showQuitConfirm) ? 'text-indigo-700' : 'text-gray-300'"
        >
          {{ showQuitConfirm ? '?' : (typedAnswer || '?') }}
        </span>
      </div>

      <!-- Passer button (skip, come back at end) — big touch target for kids -->
      <button
        v-if="!showQuitConfirm"
        @click="skipQuestion"
        :disabled="showFeedback || isLastQuestion"
        class="mt-6 md:mt-8 w-full max-w-xs py-4 md:py-5 px-6 rounded-2xl text-lg md:text-xl font-bold text-amber-700 bg-amber-100 border-2 border-amber-400 shadow-md hover:bg-amber-200 active:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none transition-colors select-none"
        aria-label="Passer (revenir à la fin)"
      >
        Passer
      </button>

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

    <!-- End quiz confirmation modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEndConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="cancelEndConfirm"
        >
          <div
            class="modal-box bg-white rounded-2xl shadow-xl max-w-sm md:max-w-md w-full p-6 md:p-8 text-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-modal-title"
            @click.stop
          >
            <h2 id="end-modal-title" class="text-lg md:text-xl font-bold text-gray-800 mb-2">
              Terminer le quiz ?
            </h2>
            <p class="text-gray-600 mb-6 md:mb-8 md:text-lg">
              Tu as répondu à toutes les questions. Tu veux voir ton score ?
            </p>
            <div class="flex gap-3 md:gap-4">
              <button
                @click="cancelEndConfirm"
                class="flex-1 py-3 px-4 md:py-4 md:px-5 rounded-xl font-semibold md:text-lg bg-gray-100 text-gray-700 active:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="confirmEnd"
                class="flex-1 py-3 px-4 md:py-4 md:px-5 rounded-xl font-semibold md:text-lg bg-green-500 text-white active:bg-green-600 transition-colors"
              >
                Terminer
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
const skippedStepIndices = ref([])  // indices where user clicked Passer (show yellow in stepper)
const answeredDeferredSteps = ref([])  // step indices we skipped then answered when we came back (show blue)
const typedAnswer = ref('')   // string built digit by digit
const timeLeft = ref(TOTAL_SECONDS)
const showFeedback = ref(false)
const cardAnimClass = ref('')
const showQuitConfirm = ref(false)
const showEndConfirm = ref(false)

let timerInterval = null

const currentQuestion = computed(() => questions.value[currentIndex.value])
// Which dot is "current" (bigger): main pass = steps done; deferred pass = the skipped step we're answering (dot state stays the same)
const currentStepIndex = computed(() => {
  const idx = currentIndex.value
  const start = deferredStartIndex.value
  if (idx < start) return answers.value.length + skippedStepIndices.value.length
  const deferredPos = idx - start
  return skippedStepIndices.value[deferredPos] ?? 0
})

// Deferred (skipped) questions start at this index; after that we show "Question 1 / N" etc.
const deferredStartIndex = computed(() => Math.max(0, questions.value.length - skippedStepIndices.value.length))
const isDeferredPhase = computed(() => currentIndex.value >= deferredStartIndex.value)

// Displayed number: increases on each answer and each skip (1..20), then 1..numSkipped for deferred questions
const displayedQuestionNumber = computed(() => {
  const idx = currentIndex.value
  const start = deferredStartIndex.value
  if (idx < start) return answers.value.length + skippedStepIndices.value.length + 1
  return idx - start + 1
})
// Total always 20, even when answering deferred (skipped) questions
const displayedQuestionTotal = computed(() => questions.value.length)

// Only disable skip when there's literally one question (nowhere to skip to)
const isLastQuestion = computed(() => questions.value.length <= 1)
const allQuestionsAnswered = computed(() => answers.value.length === questions.value.length)
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

function skipQuestion() {
  if (showFeedback.value || showQuitConfirm.value || isLastQuestion.value) return
  const start = deferredStartIndex.value
  const inDeferred = currentIndex.value >= start
  const wasAtLastIndex = currentIndex.value === questions.value.length - 1
  // Main pass: record step so dot turns yellow; deferred: step already in list, just advance
  if (!inDeferred) {
    const stepIndex = answers.value.length + skippedStepIndices.value.length
    skippedStepIndices.value.push(stepIndex)
  }
  const q = currentQuestion.value
  questions.value = [
    ...questions.value.slice(0, currentIndex.value),
    ...questions.value.slice(currentIndex.value + 1),
    q,
  ]
  typedAnswer.value = ''
  // Advance to next question: deferred → next deferred; main at last slot → first unanswered (deferred)
  // Never finish here — quiz only ends when the 2-minute timer runs out
  if (inDeferred) {
    currentIndex.value++
    if (currentIndex.value >= questions.value.length) currentIndex.value = deferredStartIndex.value
  } else if (wasAtLastIndex) {
    // Use updated deferredStartIndex (after we pushed this skip) so we land on first deferred question
    currentIndex.value = deferredStartIndex.value
  }
}

async function submitAnswer() {
  if (!typedAnswer.value || showFeedback.value) return

  const userNum = Number(typedAnswer.value)
  const correct = userNum === currentQuestion.value.answer
  showFeedback.value = true

  answers.value.push({
    question: currentQuestion.value.text,
    userAnswer: userNum,
    correctAnswer: currentQuestion.value.answer,
    correct,
  })

  // When we answer a deferred (skipped) question, mark that step as answered so its dot turns blue
  const start = deferredStartIndex.value
  if (currentIndex.value >= start) {
    const deferredPos = currentIndex.value - start
    const stepIndex = skippedStepIndices.value[deferredPos]
    if (stepIndex !== undefined) answeredDeferredSteps.value.push(stepIndex)
  }

  await new Promise((r) => setTimeout(r, FEEDBACK_DELAY))

  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    typedAnswer.value = ''
    showFeedback.value = false
  } else if (skippedStepIndices.value.length > 0) {
    // Go directly to the first skipped question instead of showing results
    currentIndex.value = deferredStartIndex.value
    typedAnswer.value = ''
    showFeedback.value = false
  } else {
    // All answered, no skipped — stay on last question and wait for the 2-minute timer
    typedAnswer.value = ''
    showFeedback.value = false
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

function openEndConfirm() {
  showEndConfirm.value = true
}

function cancelEndConfirm() {
  showEndConfirm.value = false
}

function confirmEnd() {
  showEndConfirm.value = false
  finishQuiz()
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
</style>
