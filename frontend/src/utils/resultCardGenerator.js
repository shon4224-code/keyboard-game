/**
 * Generate a beautiful result card image for sharing
 */
export async function generateResultCard(resultData) {
  const {
    wpm,
    accuracy,
    mode,
    difficulty,
    score,
    streak,
    username,
    achievement
  } = resultData;

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 1200;
  canvas.height = 630; // Standard social media sharing size
  
  // Gradient background (teal theme)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0ea5e9'); // Sky blue
  gradient.addColorStop(0.5, '#06b6d4'); // Cyan
  gradient.addColorStop(1, '#14b8a6'); // Teal
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add noise/texture overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Main content box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.roundRect(80, 80, canvas.width - 160, canvas.height - 160, 20);
  ctx.fill();
  
  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 60px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎮 keyboard', canvas.width / 2, 180);
  
  // Score display
  ctx.font = 'bold 120px Inter, sans-serif';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`${Math.round(wpm)} WPM`, canvas.width / 2, 320);
  
  // Accuracy
  ctx.font = '40px Inter, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`${Math.round(accuracy)}% Accuracy`, canvas.width / 2, 380);
  
  // Mode and difficulty
  ctx.font = '32px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  const diffText = difficulty ? ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : '';
  ctx.fillText(`${modeText}${diffText}`, canvas.width / 2, 430);
  
  // Streak if present
  if (streak > 0) {
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText(`🔥 ${streak} Day Streak`, canvas.width / 2, 480);
  }
  
  // Achievement badge if unlocked
  if (achievement) {
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`🏆 ${achievement}`, canvas.width / 2, 520);
  }
  
  // Call to action
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('Can you beat my score?', canvas.width / 2, canvas.height - 80);
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Download the result card
 */
export function downloadResultCard(blob, filename = 'keyboard-result.png') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share result card (if Web Share API is available)
 */
export async function shareResultCard(blob, resultData) {
  const file = new File([blob], 'keyboard-result.png', { type: 'image/png' });
  
  const shareData = {
    title: 'My Keyboard Game Score!',
    text: `I scored ${Math.round(resultData.wpm)} WPM on Keyboard! Can you beat me?`,
    files: [file]
  };
  
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Fallback: download the image
    downloadResultCard(blob);
    return { success: true, fallback: true };
  }
}
