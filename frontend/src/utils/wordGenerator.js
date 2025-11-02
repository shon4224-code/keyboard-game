// Generate daily words based on date
// This ensures everyone gets the same words on the same day

const WORD_POOLS = {
  3: [\n    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',\n    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',\n    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did'\n  ],
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
    'ecosystem', 'framework', 'immutable', 'normalize', 'polymeric', 'recursive', 'serialize', 'singleton', 'wireframe', 'workspace'\n  ]
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

// Generate daily words
export function generateDailyWords() {
  const day = getDayNumber();
  const words = [];
  
  // Select one word from each pool using the day as seed
  [4, 5, 6, 7, 8].forEach((length, index) => {
    const pool = WORD_POOLS[length];
    const seed = day * 5 + index; // Different seed for each word
    const randomIndex = Math.floor(seededRandom(seed) * pool.length);
    words.push(pool[randomIndex]);
  });
  
  return words;
}

// Get daily challenge (with caching)
export function getDailyChallenge() {
  const day = getDayNumber();
  const cacheKey = 'keyboard_daily_challenge';
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
    words: generateDailyWords()
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