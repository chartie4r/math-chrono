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
    const activeStageId = ref(10) // default: Semaine 10 (all multiplications)
    const difficultyId = ref('medium') // default: Moyen
    const results = ref([])

    const activeStage = computed(() => getStageById(activeStageId.value))
    const activeDifficulty = computed(() => getDifficultyById(difficultyId.value))

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

    function setActiveStage(id) {
      activeStageId.value = id
    }

    function setDifficulty(id) {
      difficultyId.value = id
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

    return {
      activeStageId,
      activeStage,
      difficultyId,
      activeDifficulty,
      results,
      bestScore,
      weekResults,
      weekStats,
      setActiveStage,
      setDifficulty,
      saveResult,
      clearResults,
      STAGES,
      DIFFICULTIES,
    }
  },
  {
    persist: true, // pinia-plugin-persistedstate — auto saves to localStorage
  },
)
