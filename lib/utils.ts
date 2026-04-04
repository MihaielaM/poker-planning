import { randomBytes } from 'crypto';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21];
export const DECK = ['1', '2', '3', '5', '8', '13', '21', '?', '∞'];

export function nearestFibonacci(value: number): number {
  return FIBONACCI_NUMBERS.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export function analyzeVotes(votes: string[]): {
  highlightMinValues: number[];
  highlightMaxValues: number[];
  average: number | null;
  nearestFib: number | null;
} {
  const numericVotes = votes
    .filter(v => v !== '?' && v !== '∞')
    .map(v => parseInt(v, 10))
    .filter(v => !isNaN(v));

  if (numericVotes.length === 0) {
    return { highlightMinValues: [], highlightMaxValues: [], average: null, nearestFib: null };
  }

  const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
  const nearestFib = nearestFibonacci(average);

  if (numericVotes.length < 2) {
    return { highlightMinValues: [], highlightMaxValues: [], average, nearestFib };
  }

  const minVal = Math.min(...numericVotes);
  const maxVal = Math.max(...numericVotes);

  if (minVal === maxVal) {
    return { highlightMinValues: [], highlightMaxValues: [], average, nearestFib };
  }

  const counts: Record<number, number> = {};
  numericVotes.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const maxCount = Math.max(...Object.values(counts));
  const allEqual = new Set(Object.values(counts)).size === 1;

  return {
    highlightMinValues: (allEqual || counts[minVal] < maxCount) ? [minVal] : [],
    highlightMaxValues: (allEqual || counts[maxVal] < maxCount) ? [maxVal] : [],
    average,
    nearestFib,
  };
}
