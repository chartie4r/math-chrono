import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STAGES, DIFFICULTIES, getStageById, getDifficultyById } from '../data/stages.js'

/**
 * Returns the most recent Friday at 17:00 as a Date.
 * This is the weekly reset boundary.
 */
function getLastFridayAfternoon() {
  const now = new Date()
  const day = now.getDay() // 0=Sun … 5=Fri … 6=Sat

  let daysBack
  if (day === 5 && now.getHours() >= 17) {
    daysBack = 0 // This Friday afternoon already passed → today is the start
  } else {
    daysBack = (day + 7 - 5) % 7
    if (daysBack === 0) daysBack = 7 // Friday before 17:00 → use previous Friday
  }

  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() - daysBack)
  cutoff.setHours(17, 0, 0, 0)
  cutoff.setMinutes(0, 0, 0)
  return cutoff
}

export const useAppStore = defineStore(
  'mathchrono',
  () => {
    const activeStageId = ref(1) // default: Semaine 1
    const difficultyId = ref('medium') // default: Moyen
    const lastMondayPromptShown = ref(null) // ISO string — when the Monday prompt was last dismissed
    const passedStageIds = ref([]) // IDs of stages the child has passed the school test for
    const results = ref([])

    const activeStage = computed(() => getStageById(activeStageId.value))
    const activeDifficulty = computed(() => getDifficultyById(difficultyId.value))

    const nextStage = computed(() => {
      const idx = STAGES.findIndex((s) => s.id === activeStageId.value)
      return idx < STAGES.length - 1 ? STAGES[idx + 1] : null
    })

    /**
     * True on Monday if the prompt hasn't been shown since last Friday 17:00.
     * This triggers the "did you pass your Friday test?" modal on HomeView.
     */
    const shouldShowMondayPrompt = computed(() => {
      const now = new Date()
      if (now.getDay() !== 1) return false // only on Monday
      const cutoff = getLastFridayAfternoon()
      if (!lastMondayPromptShown.value) return true
      return new Date(lastMondayPromptShown.value) < cutoff
    })

    const bestScore = computed(() => {
      if (results.value.length === 0) return null
      return Math.max(...results.value.map((r) => r.score))
    })

    /** Results from the current week (since last Friday 17:00). */
    const weekResults = computed(() => {
      const cutoff = getLastFridayAfternoon()
      return results.value.filter((r) => new Date(r.completedAt) >= cutoff)
    })

    const weekStats = computed(() => {
      const wr = weekResults.value
      if (wr.length === 0) return null
      const best = Math.max(...wr.map((r) => r.score))
      const avg = Math.round(wr.reduce((sum, r) => sum + r.score, 0) / wr.length)
      return { count: wr.length, best, avg }
    })

    /** Results from the previous week (between the two last Fridays at 17:00). */
    const lastWeekResults = computed(() => {
      const end = getLastFridayAfternoon()
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      return results.value.filter((r) => {
        const d = new Date(r.completedAt)
        return d >= start && d < end
      })
    })

    const lastWeekStats = computed(() => {
      const wr = lastWeekResults.value
      if (wr.length === 0) return null
      const best = Math.max(...wr.map((r) => r.score))
      const avg = Math.round(wr.reduce((sum, r) => sum + r.score, 0) / wr.length)
      return { count: wr.length, best, avg }
    })

    function setActiveStage(id) {
      activeStageId.value = id
    }

    function setDifficulty(id) {
      difficultyId.value = id
    }

    function advanceStage() {
      const idx = STAGES.findIndex((s) => s.id === activeStageId.value)
      if (idx < STAGES.length - 1) {
        // Mark the current stage as passed before advancing
        if (!passedStageIds.value.includes(activeStageId.value)) {
          passedStageIds.value.push(activeStageId.value)
        }
        activeStageId.value = STAGES[idx + 1].id
      }
    }

    function dismissMondayPrompt() {
      lastMondayPromptShown.value = new Date().toISOString()
    }

    function toggleStagePassed(id) {
      const idx = passedStageIds.value.indexOf(id)
      if (idx === -1) {
        passedStageIds.value.push(id)
      } else {
        passedStageIds.value.splice(idx, 1)
      }
    }

    /**
     * Save a completed quiz result.
     * @param {{ score: number, total: number, timeUsedSeconds: number, answers: Array }} result
     */
    function saveResult(result) {
      results.value.unshift({
        id: Date.now(),
        stageId: activeStageId.value,
        stageName: activeStage.value.name,
        difficultyId: difficultyId.value,
        difficultyLabel: activeDifficulty.value.label,
        difficultyEmoji: activeDifficulty.value.emoji,
        score: result.score,
        total: result.total,
        timeUsedSeconds: result.timeUsedSeconds,
        answers: result.answers,
        completedAt: new Date().toISOString(),
      })
    }

    function clearResults() {
      results.value = []
    }

    function clearWeekResults() {
      const cutoff = getLastFridayAfternoon()
      results.value = results.value.filter((r) => new Date(r.completedAt) < cutoff)
    }

    return {
      activeStageId,
      activeStage,
      nextStage,
      difficultyId,
      activeDifficulty,
      lastMondayPromptShown,
      shouldShowMondayPrompt,
      results,
      bestScore,
      weekResults,
      weekStats,
      lastWeekResults,
      lastWeekStats,
      passedStageIds,
      toggleStagePassed,
      setActiveStage,
      setDifficulty,
      advanceStage,
      dismissMondayPrompt,
      saveResult,
      clearResults,
      clearWeekResults,
      STAGES,
      DIFFICULTIES,
    }
  },
  {
    persist: true, // pinia-plugin-persistedstate — auto saves to localStorage
  },
)
