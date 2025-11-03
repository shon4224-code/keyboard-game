// Generate daily words based on date
// This ensures everyone gets the same words on the same day

const WORD_POOLS = {
  3: [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did'
  ],
  4: [
    'code', 'type', 'fast', 'game', 'play', 'word', 'time', 'keys', 'rush', 'beat',
    'jump', 'spin', 'dash', 'flux', 'zoom', 'glow', 'blur', 'sync', 'hack', 'byte',
    'data', 'file', 'tech', 'core', 'loop', 'node', 'link', 'task', 'flag', 'scan'
  ],
  5: [
    'swift', 'power', 'focus', 'magic', 'sharp', 'smart', 'quick', 'speed', 'cloud', 'spark',
    'flash', 'brain', 'craft', 'prime', 'shift', 'score', 'boost', 'level', 'debug', 'index',
    'react', 'array', 'class', 'stack', 'query', 'value', 'input', 'error', 'fixed', 'chunk'
  ],
  6: [
    'racing', 'typing', 'winner', 'master', 'puzzle', 'sprint', 'leader', 'finger', 'random', 'combat',
    'rhythm', 'origin', 'system', 'design', 'render', 'button', 'window', 'scroll', 'filter', 'search',
    'create', 'update', 'delete', 'insert', 'select', 'router', 'module', 'import', 'export', 'object'
  ],
  7: [
    'awesome', 'perfect', 'amazing', 'skilled', 'fastest', 'victory', 'quality', 'supreme', 'diamond', 'captain',
    'advanced', 'digital', 'virtual', 'network', 'program', 'storage', 'handler', 'promise', 'context', 'service',
    'package', 'version', 'license', 'feature', 'loading', 'console', 'compile', 'trigger', 'pattern', 'session'
  ],
  8: [
    'champion', 'keyboard', 'powerful', 'infinite', 'ultimate', 'legendary', 'velocity', 'paradise', 'treasure', 'platinum',
    'database', 'function', 'response', 'generate', 'validate', 'organize', 'engineer', 'abstract', 'username', 'password',
    'protocol', 'security', 'template', 'document', 'variable', 'constant', 'behavior', 'endpoint', 'callback', 'manifest'
  ],
  9: [
    'streaming', 'efficient', 'framework', 'architect', 'interface', 'bootstrap', 'container', 'algorithm', 'character', 'component',
    'ecosystem', 'framework', 'immutable', 'normalize', 'polymeric', 'recursive', 'serialize', 'singleton', 'wireframe', 'workspace'
  ]
};

// Simple seeded random number generator
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get day number from epoch (ensures everyone gets the same day)
function getDayNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Generate daily words based on difficulty
export function generateDailyWords(difficulty = 'normal') {
  const day = getDayNumber();
  let wordConfig;
  
  // Both modes use 5 words of varying lengths
  wordConfig = [4, 5, 6, 7, 8]; // 5 words
  
  const words = [];
  const usedWords = new Set();
  
  wordConfig.forEach((length, index) => {
    const pool = WORD_POOLS[length];
    let attempts = 0;
    let word;
    
    // Try to find a unique word, with fallback after 10 attempts
    do {
      const seed = day * wordConfig.length + index + attempts;
      const randomIndex = Math.floor(seededRandom(seed) * pool.length);
      word = pool[randomIndex];
      attempts++;
    } while (usedWords.has(word) && attempts < 10);
    
    words.push(word);
    usedWords.add(word);
  });
  
  return words;
}

// Get daily challenge (with caching by difficulty)
export function getDailyChallenge(difficulty = 'normal') {
  const day = getDayNumber();
  const cacheKey = `keyboard_daily_challenge_${difficulty}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.day === day) {
      return parsed;
    }
  }
  
  // Generate new challenge
  const challenge = {
    day,
    date: new Date().toISOString(),
    words: generateDailyWords(difficulty),
    difficulty
  };
  
  localStorage.setItem(cacheKey, JSON.stringify(challenge));
  return challenge;
}

// Check if a new day has started
export function isNewDay() {
  const cacheKey = 'keyboard_daily_challenge';
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return true;
  
  const parsed = JSON.parse(cached);
  return parsed.day !== getDayNumber();
}