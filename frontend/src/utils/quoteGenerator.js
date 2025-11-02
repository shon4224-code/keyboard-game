// Daily quotes for Quote Mode

const QUOTE_LIBRARY = [
  // Inspirational
  "The only way to do great work is to love what you do.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry, stay foolish.",
  "Life is what happens when you're busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  
  // Literary
  "It was the best of times, it was the worst of times.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "The only impossible journey is the one you never begin.",
  "In the middle of difficulty lies opportunity.",
  
  // Modern
  "Technology is best when it brings people together.",
  "The internet is becoming the town square for the global village.",
  "Design is not just what it looks like, design is how it works.",
  "Code is poetry written in logic and creativity.",
  "Every great developer you know got there by solving problems.",
  
  // Wisdom
  "The journey of a thousand miles begins with one step.",
  "Yesterday is history, tomorrow is mystery, today is a gift.",
  "You miss one hundred percent of the shots you don't take.",
  "Success is not final, failure is not fatal, it is courage to continue.",
  "What we think, we become.",
  
  // Tech/Modern Culture  
  "The best time to plant a tree was twenty years ago, the second best time is now.",
  "Simplicity is the ultimate sophistication.",
  "Quality is not an act, it is a habit.",
  "The only true wisdom is in knowing you know nothing.",
  "Be yourself, everyone else is already taken.",
  
  // Fun/Pop Culture
  "May the force be with you, always and forever.",
  "I'm going to make him an offer he can't refuse.",
  "Here's looking at you, kid.",
  "Life is like a box of chocolates, you never know what you'll get.",
  "Winter is coming, so prepare yourself.",
  
  // More variety
  "The best revenge is massive success and happiness.",
  "Don't watch the clock, do what it does, keep going.",
  "Whether you think you can or think you can't, you're right.",
  "The mind is everything, what you think you become.",
  "Strive not to be a success, but rather to be of value."
];

// Simple seeded random for consistency
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get day number from epoch
function getDayNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Get daily quote
export function getDailyQuote() {
  const day = getDayNumber();
  const index = Math.floor(seededRandom(day + 1000) * QUOTE_LIBRARY.length);
  return QUOTE_LIBRARY[index];
}

// Get daily quote challenge
export function getDailyQuoteChallenge() {
  const day = getDayNumber();
  const cacheKey = 'keyboard_daily_quote';
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
    quote: getDailyQuote(),
    type: 'quote'
  };
  
  localStorage.setItem(cacheKey, JSON.stringify(challenge));
  return challenge;
}