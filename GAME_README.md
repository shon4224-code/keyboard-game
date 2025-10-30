# keyboard - Daily Typing Challenge Game

A beautiful, Wordle-inspired typing game where players race against the clock to type 5 daily words on a completely randomized keyboard layout.

## 🎮 Game Overview

**keyboard** is a daily typing challenge that tests your typing skills and keyboard memory in a unique way. Every day at midnight, five new words are released (4, 5, 6, 7, and 8 letters), and players must type them all as fast as possible on a randomized keyboard layout.

## ✨ Features

### Core Gameplay
- **Daily Challenge**: New set of 5 words every day (4, 5, 6, 7, 8 letters)
- **Randomized Keyboard**: Each game session shuffles the QWERTY layout for an extra challenge
- **Real-time Timer**: Precise timing from start to finish with millisecond accuracy
- **Visual Feedback**: 
  - Green boxes for correct letters
  - Red boxes for incorrect letters
  - Gray boxes for pending letters
- **Progress Tracking**: See your progression through all 5 words with checkmarks
- **Physical & On-screen Keyboard**: Use your physical keyboard or click the on-screen keys

### Statistics & Tracking
- **Best Time**: Track your personal record
- **Day Streak**: Consecutive days played
- **Games Played**: Total number of challenges completed
- **Persistent Storage**: Stats saved in localStorage

### User Experience
- **3-2-1 Countdown**: Get ready before the timer starts
- **Success Animations**: Smooth transitions and celebratory animations
- **Error Handling**: Shake animation for incorrect words
- **Toast Notifications**: Real-time feedback for actions
- **Share Results**: Share your completion time with friends
- **Responsive Design**: Beautiful on desktop, tablet, and mobile

## 🎨 Design System

### Color Palette
The game uses a modern, playful color scheme based on teal and coral:
- **Primary**: Vibrant teal (HSL: 180 75% 45%) - Main actions and highlights
- **Secondary**: Warm coral (HSL: 10 80% 65%) - Streak indicators
- **Accent**: Creative purple (HSL: 270 65% 60%) - Special achievements
- **Success**: Fresh green (HSL: 140 60% 50%) - Correct letters
- **Destructive**: Vibrant red (HSL: 0 84% 60%) - Wrong letters

### Typography
- **Headings**: Space Grotesk - Bold, modern, playful
- **Body**: Inter - Clean, readable
- **Timer/Stats**: Tabular numbers for precise alignment

## 🎯 How to Play

1. **Start**: Click "START CHALLENGE" to begin
2. **Countdown**: Wait for the 3-2-1 countdown
3. **Type**: Type each word in order using the randomized keyboard
4. **Submit**: Press ENTER/SPACE or click SUBMIT to check your word
5. **Complete**: Finish all 5 words to stop the timer
6. **Celebrate**: View your results and compare with your best time!

## 🚀 Getting Started

### Installation
```bash
cd /app/frontend
yarn install
yarn start
```

## 💾 Data Persistence

Data is stored in browser localStorage:
- Daily challenge words (refreshed at midnight)
- Player statistics (best time, streak, games played)

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13+)
- Mobile browsers: ✅ Responsive design

---

**Built with React, Tailwind CSS, and Shadcn/UI**
