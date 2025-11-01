import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RandomKeyboard from '@/components/game/RandomKeyboard';
import { Timer, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

export default function GamePlay({
  dailyWords,
  startTime,
  currentWordIndex,
  setCurrentWordIndex,
  typedText,
  setTypedText,
  onComplete,
  difficulty
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shake, setShake] = useState(false);
  const [keyboardKey, setKeyboardKey] = useState(0); // Force keyboard re-render

  const currentWord = dailyWords[currentWordIndex];
  const progress = ((currentWordIndex) / dailyWords.length) * 100;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);

  // Format time display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Handle key press
  const handleKeyPress = useCallback((key) => {
    if (key === 'BACKSPACE') {
      setTypedText(prev => prev.slice(0, -1));
    } else if (key === 'ENTER' || key === 'SPACE') {
      // Check if word is complete and correct
      if (typedText.toLowerCase() === currentWord.toLowerCase()) {
        // Correct word!
        if (currentWordIndex === dailyWords.length - 1) {
          // Game complete!
          onComplete();
        } else {
          // Move to next word
          setCurrentWordIndex(prev => prev + 1);
          setTypedText('');
          
          // In hard mode, scramble keyboard for next word
          if (difficulty === 'hard') {
            setKeyboardKey(prev => prev + 1);
            toast.success(`Correct! Keyboard scrambled! ${dailyWords.length - currentWordIndex - 1} words remaining`);
          } else {
            toast.success(`Correct! ${dailyWords.length - currentWordIndex - 1} words remaining`);
          }
        }
      } else if (typedText.length > 0) {
        // Wrong word
        setShake(true);
        setTimeout(() => setShake(false), 300);
        toast.error('Incorrect! Try again');
      }
    } else {
      // Regular key
      if (typedText.length < currentWord.length) {
        setTypedText(prev => prev + key);
      }
    }
  }, [typedText, currentWord, currentWordIndex, dailyWords.length, setCurrentWordIndex, setTypedText, onComplete, difficulty]);

  // Check if current letter is correct
  const getLetterStatus = (index) => {
    if (index >= typedText.length) return 'pending';
    if (typedText[index].toLowerCase() === currentWord[index].toLowerCase()) {
      return 'correct';
    }
    return 'wrong';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 animate-flip-in">
      {/* Timer and Progress */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1">
            Word {currentWordIndex + 1} of {dailyWords.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Word Display */}
      <Card className={`p-4 sm:p-6 text-center ${shake ? 'animate-shake' : ''}`}>
        <p className="text-sm text-muted-foreground mb-3 font-medium">Type this word:</p>
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          {currentWord.split('').map((letter, index) => {
            const status = getLetterStatus(index);
            return (
              <div
                key={index}
                className={`
                  w-14 h-16 sm:w-16 sm:h-20 rounded-lg flex items-center justify-center
                  text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] uppercase
                  transition-all duration-200
                  ${
                    status === 'correct'
                      ? 'bg-success text-success-foreground scale-105'
                      : status === 'wrong'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {status === 'pending' ? letter : typedText[index]}
              </div>
            );
          })}
        </div>

        {/* Typed text feedback */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Progress:</span>
          <span className="font-mono font-semibold">
            {typedText.length}/{currentWord.length}
          </span>
        </div>
      </Card>

      {/* Words Checklist */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {dailyWords.map((word, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                index < currentWordIndex
                  ? 'bg-success/10 text-success'
                  : index === currentWordIndex
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {index < currentWordIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="text-sm font-['Space_Grotesk']">
                {word.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Keyboard */}
      <RandomKeyboard onKeyPress={handleKeyPress} currentWord={currentWord} typedText={typedText} />
    </div>
  );
}