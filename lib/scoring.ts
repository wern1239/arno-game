export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3
  const predictedResult = Math.sign(predictedHome - predictedAway)
  const actualResult = Math.sign(actualHome - actualAway)
  if (predictedResult === actualResult) return 1
  return 0
}

export function calculateFinalPairPoints(
  answer1: string,
  answer2: string,
  result1: string,
  result2: string
): number {
  const predicted = new Set([answer1, answer2])
  const actual = new Set([result1, result2])
  const hits = [...predicted].filter((t) => actual.has(t)).length
  if (hits === 2) return 12
  if (hits === 1) return 4
  return 0
}

export function calculatePodiumPoints(
  answer1: string,
  answer2: string | null | undefined,
  answer3: string | null | undefined,
  result1: string,
  result2: string,
  result3: string
): number {
  let pts = 0
  if (answer1 === result1) pts += 15
  if (answer2 && answer2 === result2) pts += 10
  if (answer3 && answer3 === result3) pts += 6
  return pts
}
