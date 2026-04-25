import { calculateBullsAndCows } from './gameLogic';

/**
 * Generates all possible 4-digit numbers with unique digits.
 */
function generateAllPossible(): string[] {
  const possible: string[] = [];
  for (let i = 0; i < 10000; i++) {
    const s = i.toString().padStart(4, '0');
    possible.push(s);
  }
  return possible;
}

export class SystemPlayer {
  private possibleNumbers: string[];

  constructor() {
    this.possibleNumbers = generateAllPossible();
  }

  /**
   * Returns a random guess from the current list of possible numbers.
   */
  getNextGuess(): string {
    if (this.possibleNumbers.length === 0) {
      // Should not happen if user feedback is consistent
      return '0000'; 
    }
    const randomIndex = Math.floor(Math.random() * this.possibleNumbers.length);
    return this.possibleNumbers[randomIndex];
  }

  /**
   * Filters the possible numbers based on the feedback from a guess.
   */
  update(guess: string, positions: number, digits: number) {
    this.possibleNumbers = this.possibleNumbers.filter((candidate) => {
      const result = calculateBullsAndCows(candidate, guess);
      return result.positions === positions && result.digits === digits;
    });
  }

  /**
   * Checks if the given feedback would result in zero possible numbers.
   * Returns true if the feedback is inconsistent with current knowledge.
   */
  isFeedbackInconsistent(guess: string, positions: number, digits: number): boolean {
    if (positions === 4) return false; // Winning guess is always consistent with something
    return !this.possibleNumbers.some((candidate) => {
      const result = calculateBullsAndCows(candidate, guess);
      return result.positions === positions && result.digits === digits;
    });
  }

  getPossibleCount(): number {
    return this.possibleNumbers.length;
  }
}
