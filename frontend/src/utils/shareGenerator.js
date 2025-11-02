// Generate shareable text for social media

const getAppUrl = () => {
  // Use current domain from window, environment variable, or fallback
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  // Use environment variable if available
  if (process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }
  // Final fallback for server-side rendering or build time
  return 'https://keyboard-game-2i5h.vercel.app';
};

export const generateShareText = (stats) => {
  const { completionTime, difficulty, streak, wordsCompleted = 5 } = stats;
  
  // Format time
  const totalSeconds = Math.floor(completionTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Difficulty emoji
  const difficultyEmoji = difficulty === 'hard' ? '💪' : '✨';
  const difficultyText = difficulty === 'hard' ? 'Hard Mode' : 'Normal Mode';
  
  // Streak text
  const streakText = streak > 0 ? `\n🔥 ${streak} Day Streak` : '';
  
  // Get app URL dynamically
  const appUrl = getAppUrl();
  const domain = appUrl.replace('https://', '').replace('http://', '');
  
  // Build share message
  const shareMessage = `⌨️ keyboard - Daily Challenge\n\n🏆 Time: ${timeStr}\n${difficultyEmoji} ${difficultyText}\n📝 ${wordsCompleted}/5 words${streakText}\n\nCan you beat my time?\n\n🎮 Play at ${domain}`;
  
  return shareMessage;
};

export const generateTwitterShare = (stats) => {
  const { completionTime, difficulty, streak } = stats;
  
  const totalSeconds = Math.floor(completionTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const difficultyEmoji = difficulty === 'hard' ? '💪' : '✨';
  const streakText = streak > 0 ? ` | 🔥 ${streak} day streak` : '';
  
  const tweetText = `⌨️ I completed today's keyboard challenge in ${timeStr}! ${difficultyEmoji}${streakText}\n\nCan you beat my time? 🎮`;
  
  // Use dynamic URL
  const url = getAppUrl();
  const hashtags = 'keyboardjumble,wordgame';
  
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};