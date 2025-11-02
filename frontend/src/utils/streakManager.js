// Streak management utility

export const getStreakData = () => {
  const saved = localStorage.getItem('keyboard_streak_data');
  if (!saved) {
    return {
      currentStreak: 0,
      lastPlayedDate: null,
      longestStreak: 0,
      totalDaysPlayed: 0
    };
  }
  return JSON.parse(saved);
};

const saveStreakData = (data) => {
  localStorage.setItem('keyboard_streak_data', JSON.stringify(data));
};

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
};

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
};

export const updateStreak = () => {
  const streakData = getStreakData();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Already played today
  if (streakData.lastPlayedDate === today) {
    return streakData;
  }

  let newStreak = streakData.currentStreak;

  if (streakData.lastPlayedDate === yesterday) {
    // Played yesterday, continue streak
    newStreak += 1;
  } else if (streakData.lastPlayedDate === null || streakData.lastPlayedDate !== today) {
    // Streak broken or first time
    newStreak = 1;
  }

  const updatedData = {
    currentStreak: newStreak,
    lastPlayedDate: today,
    longestStreak: Math.max(newStreak, streakData.longestStreak),
    totalDaysPlayed: streakData.totalDaysPlayed + 1
  };

  saveStreakData(updatedData);
  return updatedData;
};

export const getStreakMilestone = (streak) => {
  if (streak >= 100) return { level: 'legend', message: '💎 LEGEND STATUS!', emoji: '💎' };
  if (streak >= 30) return { level: 'unstoppable', message: '🔥 UNSTOPPABLE!', emoji: '🔥' };
  if (streak >= 7) return { level: 'onfire', message: '🚀 ON FIRE!', emoji: '🚀' };
  if (streak >= 3) return { level: 'warm', message: '⭐ GETTING WARM!', emoji: '⭐' };
  return null;
};

export const hasPlayedToday = () => {
  const streakData = getStreakData();
  const today = getTodayDateString();
  return streakData.lastPlayedDate === today;
};