import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RandomKeyboard from '@/components/game/RandomKeyboard';
import { Timer } from 'lucide-react';
import { toast } from 'sonner';

export default function GamePlayQuote({
  dailyQuote,
  startTime,
  typedText,
  setTypedText,
  onComplete,
  difficulty,
  mistakes,
  setMistakes
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [keyboardKey, setKeyboardKey] = useState(0);

  const progress = (typedText.length / dailyQuote.length) * 100;

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
      // Space for typing quotes
      if (key === 'SPACE' && typedText.length < dailyQuote.length) {
        setTypedText(prev => prev + ' ');
      }
      // Check if quote is complete
      if (typedText.toLowerCase() === dailyQuote.toLowerCase()) {
        onComplete();
      }
    } else {
      // Regular key
      if (typedText.length < dailyQuote.length) {
        const expectedChar = dailyQuote[typedText.length];
        if (key.toLowerCase() !== expectedChar.toLowerCase()) {
          setMistakes(prev => prev + 1);
        }
        setTypedText(prev => prev + key);
        
        // Check if complete
        if (typedText.length + 1 === dailyQuote.length) {
          setTimeout(() => onComplete(), 100);
        }
      }
    }
  }, [typedText, dailyQuote, setTypedText, onComplete, setMistakes]);

  // Get character status
  const getCharStatus = (index) => {
    if (index >= typedText.length) return 'pending';
    if (typedText[index].toLowerCase() === dailyQuote[index].toLowerCase()) {
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
          <div className="flex items-center gap-2">
            {['hard', 'insane'].includes(difficulty) && (
              <Badge variant="destructive" className="text-xs font-medium">
                {difficulty === 'insane' ? 'INSANE' : 'Hard'} Mode
              </Badge>
            )}
            <Badge variant="outline" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1">
              {typedText.length} / {dailyQuote.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Quote Display */}
      <Card className="p-4 sm:p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3 font-medium">Type this quote:</p>
        <div className="text-left max-w-2xl mx-auto bg-muted/30 rounded-lg p-4 overflow-hidden">
          <p className="text-sm sm:text-base font-mono leading-relaxed break-words">
            {dailyQuote.split('').map((char, index) => {
              const status = getCharStatus(index);
              return (
                <span
                  key={index}
                  className={`
                    transition-all duration-100 inline
                    ${
                      status === 'correct'
                        ? 'text-success font-semibold'
                        : status === 'wrong'
                        ? 'text-destructive font-semibold bg-destructive/10'
                        : 'text-muted-foreground'
                    }
                    ${index === typedText.length ? 'bg-primary/20 animate-pulse' : ''}
                  `}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </p>
        </div>
        
        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Accuracy: {Math.round(((typedText.length - mistakes) / Math.max(1, typedText.length)) * 100)}%</span>
          <span>•</span>
          <span>Mistakes: {mistakes}</span>
        </div>
      </Card>

      {/* Keyboard */}
      <RandomKeyboard 
        onKeyPress={handleKeyPress} 
        currentWord={dailyQuote}
        typedText={typedText}
        keyboardKey={keyboardKey}
      />
    </div>
  );
}
