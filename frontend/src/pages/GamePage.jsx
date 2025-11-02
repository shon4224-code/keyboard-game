import { useState, useEffect } from 'react';
import GameHeader from '@/components/game/GameHeader';
import GameStart from '@/components/game/GameStart';
import GamePlay from '@/components/game/GamePlay';
import GameResults from '@/components/game/GameResults';
import { getDailyChallenge } from '@/utils/wordGenerator';
import { getDailyQuoteChallenge } from '@/utils/quoteGenerator';
import { getStreakData, updateStreak } from '@/utils/streakManager';
import { calculateWPM, calculateAccuracy } from '@/utils/statsCalculator';
import { toast } from 'sonner';

export default function GamePage() {
  const [gameState, setGameState] = useState('start'); // start, playing, complete
  const [gameMode, setGameMode] = useState('words'); // words or quote
  const [dailyWords, setDailyWords] = useState([]);
  const [dailyQuote, setDailyQuote] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard, insane
  const [streakData, setStreakData] = useState(getStreakData());
  const [mistakes, setMistakes] = useState(0);
  const [stats, setStats] = useState({
    todayTime: null,
    bestTime: null,
    gamesPlayed: 0,
    streak: 0,
    wpm: 0,
    accuracy: 100
  });

  // Load daily content and stats on mount
  useEffect(() => {
    loadDailyContent();
    loadStats();
    setStreakData(getStreakData());
  }, [difficulty, gameMode]);
  
  const loadDailyContent = () => {
    if (gameMode === 'words') {
      const challenge = getDailyChallenge(difficulty);
      setDailyWords(challenge.words);
    } else {
      const challenge = getDailyQuoteChallenge();
      setDailyQuote(challenge.quote);
    }
  };

  const loadStats = () => {
    const savedStats = localStorage.getItem('keyboard_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveStats = (completionTime) => {
    const newStats = {
      todayTime: completionTime,
      bestTime: stats.bestTime ? Math.min(stats.bestTime, completionTime) : completionTime,
      gamesPlayed: stats.gamesPlayed + 1,
      streak: stats.streak + 1
    };
    localStorage.setItem('keyboard_stats', JSON.stringify(newStats));
    setStats(newStats);
  };

  const handleStartGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    setTypedText('');
    setMistakes(0);
    const modeText = gameMode === 'quote' ? 'Quote' : 'Words';
    const diffText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    toast.success(`${modeText} Mode (${diffText}) started! Good luck!`);
  };

  const handleGameComplete = () => {
    const completionTime = Date.now() - startTime;
    setEndTime(completionTime);
    setGameState('complete');
    
    // Calculate WPM and accuracy
    const totalText = gameMode === 'quote' ? dailyQuote : dailyWords.join('');
    const wpm = calculateWPM(totalText, completionTime);
    const accuracy = calculateAccuracy(totalText.length, totalText.length, mistakes);
    
    // Update streak
    const newStreakData = updateStreak();
    setStreakData(newStreakData);
    
    // Save stats with WPM and accuracy
    const newStats = {
      todayTime: completionTime,
      bestTime: stats.bestTime ? Math.min(stats.bestTime, completionTime) : completionTime,
      gamesPlayed: stats.gamesPlayed + 1,
      streak: newStreakData.currentStreak,
      wpm,
      accuracy
    };
    localStorage.setItem('keyboard_stats', JSON.stringify(newStats));
    setStats(newStats);
    
    toast.success('Congratulations! Challenge completed!');
  };

  const handlePlayAgain = () => {
    loadDailyContent();
    setGameState('start');
    setStartTime(null);
    setEndTime(null);
    setCurrentWordIndex(0);
    setTypedText('');
    setMistakes(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader stats={stats} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {gameState === 'start' && (
          <GameStart 
            onStart={handleStartGame} 
            dailyWords={dailyWords}
            dailyQuote={dailyQuote}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            gameMode={gameMode}
            setGameMode={setGameMode}
            streakData={streakData}
          />
        )}
        
        {gameState === 'playing' && (
          <GamePlay
            dailyWords={dailyWords}
            dailyQuote={dailyQuote}
            gameMode={gameMode}
            startTime={startTime}
            currentWordIndex={currentWordIndex}
            setCurrentWordIndex={setCurrentWordIndex}
            typedText={typedText}
            setTypedText={setTypedText}
            onComplete={handleGameComplete}
            difficulty={difficulty}
            mistakes={mistakes}
            setMistakes={setMistakes}
          />
        )}
        
        {gameState === 'complete' && (
          <GameResults
            completionTime={endTime}
            stats={stats}
            streakData={streakData}
            difficulty={difficulty}
            gameMode={gameMode}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
    </div>
  );
}