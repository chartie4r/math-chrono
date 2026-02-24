export const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Facile',
    emoji: '🟢',
    freeNumbers: [1, 2, 3, 4, 5],
    description: 'Nombres 1 à 5',
  },
  {
    id: 'medium',
    label: 'Moyen',
    emoji: '🟡',
    freeNumbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Tous les nombres (0–10)',
  },
  {
    id: 'hard',
    label: 'Difficile',
    emoji: '🔴',
    freeNumbers: [4, 5, 6, 7, 8, 9, 10],
    description: 'Nombres 4 à 10',
  },
]

export function getDifficultyById(id) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1]
}

export const STAGES = [
  {
    id: 1,
    name: 'Semaine 1',
    description: 'Multiplication par 0 et 10',
    operations: ['multiplication'],
    numbers: [0, 10],
  },
  {
    id: 2,
    name: 'Semaine 2',
    description: 'Multiplication par 0, 2 et 10',
    operations: ['multiplication'],
    numbers: [0, 2, 10],
  },
  {
    id: 3,
    name: 'Semaine 3',
    description: 'Multiplication par 0, 2, 5 et 10',
    operations: ['multiplication'],
    numbers: [0, 2, 5, 10],
  },
  {
    id: 4,
    name: 'Semaine 4',
    description: 'Multiplication par 0, 1, 2, 5 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 5, 10],
  },
  {
    id: 5,
    name: 'Semaine 5',
    description: 'Multiplication par 0, 1, 2, 3, 5 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 5, 10],
  },
  {
    id: 6,
    name: 'Semaine 6',
    description: 'Multiplication par 0, 1, 2, 3, 4, 5 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 4, 5, 10],
  },
  {
    id: 7,
    name: 'Semaine 7',
    description: 'Multiplication par 0–6 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 10],
  },
  {
    id: 8,
    name: 'Semaine 8',
    description: 'Multiplication par 0–7 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 10],
  },
  {
    id: 9,
    name: 'Semaine 9',
    description: 'Multiplication par 0–8 et 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10],
  },
  {
    id: 10,
    name: 'Semaine 10',
    description: 'Multiplication par tous les nombres de 0 à 10',
    operations: ['multiplication'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 11,
    name: 'Semaine 11',
    description: 'Multiplication et Division avec tous les nombres de 0 à 10',
    operations: ['multiplication', 'division'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
]

export function getStageById(id) {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Generate an array of `count` unique questions for the given stage and difficulty.
 *
 * Rules:
 *  1. No duplicate question — 0×5 and 5×0 are the same and will not both appear.
 *  2. Every number in stage.numbers appears at least once before filling remaining slots.
 *  3. The "free" number is restricted to difficulty.freeNumbers:
 *       easy   → [1–5]   medium → [0–10]   hard → [4–10]
 *  4. If the unique-question pool is exhausted (small stage + hard difficulty), the
 *     existing questions are recycled to reach `count`.
 */
export function generateQuestions(stage, difficulty, count = 20) {
  const freePool = difficulty?.freeNumbers ?? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const usedKeys = new Set()

  // ── helpers ──────────────────────────────────────────────────────────────

  function tryMultiplication(stageNum) {
    for (const a of shuffle(freePool)) {
      // Commutative: treat {a, stageNum} as an unordered pair
      const key = `x_${Math.min(a, stageNum)}_${Math.max(a, stageNum)}`
      if (!usedKeys.has(key)) {
        usedKeys.add(key)
        const [l, r] = Math.random() < 0.5 ? [a, stageNum] : [stageNum, a]
        return { text: `${l} × ${r}`, answer: l * r, operation: 'multiplication' }
      }
    }
    return null
  }

  function tryDivision(stageNum) {
    if (stageNum === 0) return null // cannot divide by zero
    for (const quotient of shuffle(freePool)) {
      const dividend = stageNum * quotient
      const key = `d_${dividend}_${stageNum}`
      if (!usedKeys.has(key)) {
        usedKeys.add(key)
        return { text: `${dividend} ÷ ${stageNum}`, answer: quotient, operation: 'division' }
      }
    }
    return null
  }

  function tryQuestion(stageNum) {
    for (const op of shuffle(stage.operations)) {
      const q = op === 'multiplication' ? tryMultiplication(stageNum) : tryDivision(stageNum)
      if (q) return q
    }
    return null
  }

  // ── phase 1: cover every stage number at least once ──────────────────────
  const questions = []
  for (const n of shuffle([...stage.numbers])) {
    if (questions.length >= count) break
    const q = tryQuestion(n)
    if (q) questions.push(q)
  }

  // ── phase 2: fill remaining slots with unique questions ───────────────────
  let attempts = 0
  while (questions.length < count && attempts < 500) {
    attempts++
    const q = tryQuestion(pickRandom(stage.numbers))
    if (q) questions.push(q)
  }

  // ── phase 3: pool exhausted (tiny stage + hard difficulty) → recycle ──────
  if (questions.length < count) {
    const pool = [...questions]
    while (questions.length < count) {
      questions.push({ ...pickRandom(pool) })
    }
  }

  return shuffle(questions)
}
