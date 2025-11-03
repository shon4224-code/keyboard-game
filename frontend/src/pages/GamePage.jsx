import { useState, useEffect } from 'react';
import GameHeader from '@/components/game/GameHeader';
import GameStart from '@/components/game/GameStart';
import GamePlay from '@/components/game/GamePlay';
import GamePlayTrivia from '@/components/game/GamePlayTrivia';
import GamePlaySprint from '@/components/game/GamePlaySprint';
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
  const [gameMode, setGameMode] = useState('words'); // words, quote, trivia, or sprint
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

  const saveStats = (completionTime, wpm, accuracy) => {
    const newStats = {
      todayTime: completionTime,
      bestTime: stats.bestTime ? Math.min(stats.bestTime, completionTime) : completionTime,
      gamesPlayed: stats.gamesPlayed + 1,
      streak: stats.streak + 1,
      wpm,
      accuracy
    };
    localStorage.setItem('keyboard_stats', JSON.stringify(newStats));
    setStats(newStats);
  };

  // Track keystroke timing for anti-cheat
  const trackKeystroke = () => {
    const now = Date.now();
    if (lastKeystrokeTime) {
      const timeDiff = now - lastKeystrokeTime;
      setKeystrokeData(prev => [...prev, timeDiff]);
    }
    setLastKeystrokeTime(now);
  };

  const handleStartGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    setTypedText('');
    setMistakes(0);
    setKeystrokeData([]);
    setLastKeystrokeTime(null);
    setTriviaResults(null);
    
    const modeText = gameMode === 'trivia' ? 'Trivia' : gameMode === 'quote' ? 'Quote' : 'Words';
    const diffText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    toast.success(`${modeText} Mode (${diffText}) started! Good luck!`);
  };

  const handleGameComplete = async () => {
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
    
    // Submit to leaderboard if user is logged in
    if (user) {
      await submitScoreToLeaderboard({
        wpm,
        accuracy,
        time_seconds: completionTime / 1000,
        score: 0,
        mistakes,
        streak: newStreakData.currentStreak
      });
    }
    
    toast.success('Congratulations! Challenge completed!');
  };

  const handleTriviaComplete = async (results) => {
    const completionTime = Date.now() - startTime;
    setEndTime(completionTime);
    setGameState('complete');
    setTriviaResults(results);
    
    // Calculate trivia score
    const score = calculateTriviaScore(
      results.timeSeconds,
      results.correctCount,
      results.totalQuestions,
      results.maxStreak
    );
    
    // Calculate WPM based on total characters typed
    const totalChars = results.answers.reduce((sum, a) => sum + a.userAnswer.length, 0);
    const wpm = calculateWPM({ length: totalChars }, completionTime);
    const accuracy = (results.correctCount / results.totalQuestions) * 100;
    
    // Update streak
    const newStreakData = updateStreak();
    setStreakData(newStreakData);
    
    // Save stats
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
    
    // Submit to leaderboard if user is logged in
    if (user) {
      await submitScoreToLeaderboard({
        wpm,
        accuracy,
        time_seconds: results.timeSeconds,
        score,
        mistakes: results.totalQuestions - results.correctCount,
        streak: newStreakData.currentStreak
      });
    }
    
    toast.success(`Trivia Complete! Score: ${score}`);
  };

  const submitScoreToLeaderboard = async (scoreData) => {
    try {
      const result = await submitScore({
        user_id: user.id,
        username: user.username,
        mode: gameMode,
        difficulty: difficulty,
        ...scoreData,
        keystroke_data: keystrokeData.slice(0, 50), // Send first 50 keystrokes
        total_keystrokes: keystrokeData.length
      });
      
      if (result.success) {
        toast.success('Score submitted to leaderboard!');
      } else {
        if (result.error.includes('rejected')) {
          toast.error('Score not submitted: Suspicious activity detected');
        } else {
          toast.error('Failed to submit score');
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handlePlayAgain = () => {
    loadDailyContent();
    setGameState('start');
    setStartTime(null);
    setEndTime(null);
    setCurrentWordIndex(0);
    setTypedText('');
    setMistakes(0);
    setKeystrokeData([]);
    setLastKeystrokeTime(null);
    setTriviaResults(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader 
        stats={stats} 
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {gameState === 'start' && (
          <GameStart 
            onStart={handleStartGame} 
            dailyWords={dailyWords}
            dailyQuote={dailyQuote}
            triviaQuestions={triviaQuestions}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            gameMode={gameMode}
            setGameMode={setGameMode}
            streakData={streakData}
          />
        )}
        
        {gameState === 'playing' && gameMode !== 'trivia' && (
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
            onKeystroke={trackKeystroke}
          />
        )}
        
        {gameState === 'playing' && gameMode === 'trivia' && (
          <GamePlayTrivia
            questions={triviaQuestions}
            startTime={startTime}
            onComplete={handleTriviaComplete}
          />
        )}
        
        {gameState === 'complete' && (
          <GameResults
            completionTime={endTime}
            stats={stats}
            streakData={streakData}
            difficulty={difficulty}
            gameMode={gameMode}
            triviaResults={triviaResults}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>
      
      {/* Modals */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      
      {showUsernameModal && (
        <UsernameModal 
          open={showUsernameModal} 
          onClose={() => setShowUsernameModal(false)} 
        />
      )}
    </div>
  );
}