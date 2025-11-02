import { getDailyTrivia } from './api';

/**
 * Get daily trivia questions
 */
export async function getDailyTriviaQuestions() {
  const result = await getDailyTrivia();
  if (result.success) {
    return result.data;
  }
  return [];
}

/**
 * Check if an answer is correct (fuzzy matching)
 */
export function checkAnswer(userAnswer, correctAnswer, alternativeAnswers = []) {
  const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = normalize(correctAnswer);
  
  // Check exact match
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Check alternative answers
  for (const alt of alternativeAnswers) {
    if (normalize(alt) === normalizedUser) {
      return true;
    }
  }
  
  // Check if user answer is contained in correct answer or vice versa
  if (normalizedUser.length >= 3) {
    if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate trivia score
 * Score formula: (Speed × Accuracy) + Streak Bonuses
 */
export function calculateTriviaScore(timeSeconds, correctAnswers, totalQuestions, streak) {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const speedScore = Math.max(0, 1000 - (timeSeconds * 10)); // Max 1000 points for speed
  const accuracyScore = accuracy * 10; // Max 1000 points for accuracy
  const streakBonus = streak * 100; // 100 points per consecutive correct answer
  
  return Math.round(speedScore + accuracyScore + streakBonus);
}
