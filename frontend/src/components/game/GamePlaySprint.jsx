import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RandomKeyboard from '@/components/game/RandomKeyboard';
import { Timer, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function GamePlaySprint({
  startTime,
  onComplete
}) {
  const [currentWord, setCurrentWord] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [keyboardKey, setKeyboardKey] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60000); // 60 seconds in ms
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [usedWords, setUsedWords] = useState(new Set());

  const SPRINT_DURATION = 60000; // 60 seconds

  const WORD_POOL = [
    'code', 'type', 'fast', 'game', 'play', 'word', 'time', 'keys', 'rush', 'beat',
    'jump', 'spin', 'dash', 'flux', 'zoom', 'glow', 'blur', 'sync', 'hack', 'byte',
    'swift', 'power', 'focus', 'magic', 'sharp', 'smart', 'quick', 'speed', 'cloud', 'spark',
    'flash', 'brain', 'craft', 'prime', 'shift', 'score', 'boost', 'level', 'debug', 'index',
    'racing', 'typing', 'winner', 'master', 'puzzle', 'sprint', 'leader', 'finger', 'random', 'combat'
  ];

  // Generate random word for sprint mode (no duplicates)
  const generateWord = useCallback(() => {
    // If all words used, reset
    if (usedWords.size >= WORD_POOL.length) {
      setUsedWords(new Set());
    }
    
    let word;
    let attempts = 0;
    do {
      word = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
      attempts++;
    } while (usedWords.has(word) && attempts < 50);
    
    setUsedWords(prev => new Set([...prev, word]));
    return word.toUpperCase();
  }, [usedWords]);

  // Initialize with first word
  useEffect(() => {
    setCurrentWord(generateWord());
  }, [generateWord]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = SPRINT_DURATION - elapsed;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        onComplete({
          wordsCompleted,
          totalCharacters,
          mistakes,
          timeSeconds: SPRINT_DURATION / 1000
        });
      } else {
        setTimeRemaining(remaining);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [startTime, wordsCompleted, totalCharacters, mistakes, onComplete]);

  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Handle key press
  const handleKeyPress = useCallback((key) => {
    if (timeRemaining <= 0) return;

    if (key === 'BACKSPACE') {
      setTypedText(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      // Check if word is complete and correct
      if (typedText === currentWord) {
        // Correct word!
        setWordsCompleted(prev => prev + 1);
        setTotalCharacters(prev => prev + currentWord.length);
        setTypedText('');
        setCurrentWord(generateWord());
        setKeyboardKey(prev => prev + 1); // Scramble keyboard
        toast.success('Correct!');
      } else {
        // Wrong word
        setMistakes(prev => prev + 1);
        toast.error('Wrong! Try again');
      }
    } else {
      // Regular letter key
      if (typedText.length < currentWord.length) {
        const expectedChar = currentWord[typedText.length];
        if (key !== expectedChar) {
          setMistakes(prev => prev + 1);
        }
        setTypedText(prev => prev + key);
        
        // Auto-submit if word is complete
        if (typedText.length + 1 === currentWord.length) {
          setTimeout(() => {
            const fullWord = typedText + key;
            if (fullWord === currentWord) {
              setWordsCompleted(prev => prev + 1);
              setTotalCharacters(prev => prev + currentWord.length);
              setTypedText('');
              setCurrentWord(generateWord());
              setKeyboardKey(prev => prev + 1);
              toast.success('Correct!');
            }
          }, 100);
        }
      }
    }
  }, [typedText, currentWord, timeRemaining, generateWord]);

  const progress = (typedText.length / currentWord.length) * 100;
  const timeProgress = (timeRemaining / SPRINT_DURATION) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 px-4 animate-flip-in">
      {/* Timer and Stats */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-3xl font-bold font-['Space_Grotesk'] tabular-nums text-primary">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm font-medium gap-1">
              <Target className="w-4 h-4" />
              {wordsCompleted} words
            </Badge>
            <Badge variant="secondary" className="text-sm font-medium gap-1">
              <Zap className="w-4 h-4" />
              {mistakes} errors
            </Badge>
          </div>
        </div>
        <Progress value={timeProgress} className="h-2" />
      </Card>

      {/* Current Word Display */}
      <Card className="p-6 sm:p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">Type this word:</p>
        
        <div className="mb-6">
          <h2 className="text-4xl sm:text-5xl font-bold font-['Space_Grotesk'] tracking-wider mb-4">
            {currentWord}
          </h2>
          
          {/* Letter boxes showing progress */}
          <div className="flex justify-center gap-2 mb-4 overflow-x-auto px-2">
            {currentWord.split('').map((letter, index) => {
              const isTyped = index < typedText.length;
              const isCorrect = isTyped && typedText[index] === letter;
              const isWrong = isTyped && typedText[index] !== letter;
              
              return (
                <div
                  key={index}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                    text-xl sm:text-2xl font-bold font-['Space_Grotesk'] transition-all
                    ${isCorrect ? 'bg-success/20 border-success text-success' : ''}
                    ${isWrong ? 'bg-destructive/20 border-destructive text-destructive' : ''}
                    ${!isTyped ? 'border-border bg-muted/30' : ''}
                  `}
                >
                  {isTyped ? typedText[index] : ''}
                </div>
              );
            })}
          </div>

          <Progress value={progress} className="h-2 max-w-md mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">
            {typedText.length} / {currentWord.length}
          </p>
        </div>
      </Card>

      {/* Randomized Keyboard */}
      <div className="pb-4">
        <RandomKeyboard 
          onKeyPress={handleKeyPress}
          currentWord={currentWord}
          typedText={typedText}
          keyboardKey={keyboardKey}
        />
      </div>
    </div>
  );
}
