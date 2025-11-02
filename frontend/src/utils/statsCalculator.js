// Calculate WPM and accuracy

export const calculateWPM = (text, timeMs) => {
  // Standard: 5 characters = 1 word
  const characters = text.length;
  const words = characters / 5;
  const minutes = timeMs / 60000;
  const wpm = Math.round(words / minutes);
  return wpm;
};

export const calculateAccuracy = (correctChars, totalChars, mistakes = 0) => {
  if (totalChars === 0) return 100;
  
  // Calculate accuracy based on correct characters and mistakes
  const accuracy = ((correctChars - mistakes) / totalChars) * 100;
  return Math.max(0, Math.min(100, Math.round(accuracy)));
};

export const formatWPM = (wpm) => {
  return `${wpm} WPM`;
};

export const formatAccuracy = (accuracy) => {
  return `${accuracy}%`;
};

// Get performance rating based on WPM
export const getWPMRating = (wpm) => {
  if (wpm >= 80) return { label: 'Expert', color: 'text-purple-500', emoji: '🔥' };
  if (wpm >= 60) return { label: 'Advanced', color: 'text-blue-500', emoji: '⚡' };
  if (wpm >= 40) return { label: 'Intermediate', color: 'text-green-500', emoji: '👍' };
  if (wpm >= 20) return { label: 'Beginner', color: 'text-yellow-500', emoji: '🌱' };
  return { label: 'Learning', color: 'text-gray-500', emoji: '📚' };
};

// Get accuracy rating
export const getAccuracyRating = (accuracy) => {
  if (accuracy >= 98) return { label: 'Perfect', color: 'text-purple-500' };
  if (accuracy >= 95) return { label: 'Excellent', color: 'text-blue-500' };
  if (accuracy >= 90) return { label: 'Great', color: 'text-green-500' };
  if (accuracy >= 80) return { label: 'Good', color: 'text-yellow-500' };
  return { label: 'Needs Practice', color: 'text-orange-500' };
};