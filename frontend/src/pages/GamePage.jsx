import { useState, useEffect } from 'react';
import GameHeader from '@/components/game/GameHeader';
import GameStart from '@/components/game/GameStart';
import GamePlay from '@/components/game/GamePlay';
import GamePlayTrivia from '@/components/game/GamePlayTrivia';
import GameResults from '@/components/game/GameResults';
import Leaderboard from '@/components/game/Leaderboard';
import UsernameModal from '@/components/ui/UsernameModal';
import { getDailyChallenge } from '@/utils/wordGenerator';
import { getDailyQuoteChallenge } from '@/utils/quoteGenerator';
import { getDailyTriviaQuestions, calculateTriviaScore } from '@/utils/triviaHelper';
import { getStreakData, updateStreak } from '@/utils/streakManager';
import { calculateWPM, calculateAccuracy } from '@/utils/statsCalculator';
import { submitScore } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export default function GamePage() {
  const [gameState, setGameState] = useState('start'); // start, playing, complete
  const [gameMode, setGameMode] = useState('words'); // words, quote, or trivia
  const [dailyWords, setDailyWords] = useState([]);
  const [dailyQuote, setDailyQuote] = useState('');
  const [triviaQuestions, setTriviaQuestions] = useState([]);
  const [triviaResults, setTriviaResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard, insane
  const [streakData, setStreakData] = useState(getStreakData());
  const [mistakes, setMistakes] = useState(0);
  const [keystrokeData, setKeystrokeData] = useState([]); // For anti-cheat
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState({
    todayTime: null,
    bestTime: null,
    gamesPlayed: 0,
    streak: 0,
    wpm: 0,
    accuracy: 100
  });

  // Check if user needs to register
  useEffect(() => {
    if (!userLoading && !user) {
      // Show username modal after a short delay
      setTimeout(() => setShowUsernameModal(true), 500);
    }
  }, [user, userLoading]);

  // Load daily content and stats on mount
  useEffect(() => {
    loadDailyContent();
    loadStats();
    setStreakData(getStreakData());
  }, [difficulty, gameMode]);
  
  const loadDailyContent = async () => {
    if (gameMode === 'words') {
      const challenge = getDailyChallenge(difficulty);
      setDailyWords(challenge.words);
    } else if (gameMode === 'quote') {
      const challenge = getDailyQuoteChallenge();
      setDailyQuote(challenge.quote);
    } else if (gameMode === 'trivia') {
      const questions = await getDailyTriviaQuestions();
      setTriviaQuestions(questions);
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