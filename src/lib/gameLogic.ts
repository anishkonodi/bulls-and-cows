export interface GameResult {
  positions: number;
  digits: number;
}

/**
 * Calculates the number of Matched Positions and Matched Digits for a guess.
 * 
 * Rule: 
 * - Positions: Exactly same digit in same spot.
 * - Digits: Total number of digits from guess that have a corresponding digit in the secret 
 *           (handles duplicates by taking the minimum count of each digit).
 * 
 * @param secret The 4-digit secret number string.
 * @param guess The 4-digit guess string.
 */
export function calculateBullsAndCows(secret: string, guess: string): GameResult {
  let positions = 0;
  let digits = 0;

  const secretArr = secret.split('');
  const guessArr = guess.split('');

  // Count Positions
  for (let i = 0; i < 4; i++) {
    if (guessArr[i] === secretArr[i]) {
      positions++;
    }
  }

  // Count Digits (Frequency Intersection)
  const secretFreq: Record<string, number> = {};
  const guessFreq: Record<string, number> = {};

  for (const char of secretArr) {
    secretFreq[char] = (secretFreq[char] || 0) + 1;
  }
  for (const char of guessArr) {
    guessFreq[char] = (guessFreq[char] || 0) + 1;
  }

  // Sum of min(secretCount, guessCount) for each unique digit
  for (const char in guessFreq) {
    if (secretFreq[char]) {
      digits += Math.min(secretFreq[char], guessFreq[char]);
    }
  }

  return { positions, digits };
}
