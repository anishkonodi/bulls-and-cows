/**
 * Generates a random 4-digit number string where each digit is unique.
 */
export function generateSecretNumber(): string {
  const digits = Array.from({ length: 10 }, (_, i) => i.toString());
  let result = '';
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits[randomIndex];
    digits.splice(randomIndex, 1);
  }
  
  return result;
}

/**
 * Validates if a string is a valid 4-digit guess.
 */
export function validateGuess(guess: string): boolean {
  return /^\d{4}$/.test(guess);
}

/**
 * Validates if a string has unique digits.
 * Standard Bulls and Cows often requires unique digits.
 */
export function hasUniqueDigits(str: string): boolean {
  return new Set(str).size === str.length;
}
