import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Delete, CornerDownLeft } from 'lucide-react';

export default function RandomKeyboard({ onKeyPress, currentWord, typedText }) {
  const [pressedKey, setPressedKey] = useState(null);

  // Generate randomized keyboard layout (memoized so it doesn't change)
  const keyboardLayout = useMemo(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    
    // Split into rows
    return [
      shuffled.slice(0, 10),
      shuffled.slice(10, 19),
      shuffled.slice(19, 26)
    ];
  }, []); // Empty dependency array means this only runs once

  // Handle physical keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      const key = e.key.toUpperCase();
      
      if (key === 'BACKSPACE') {
        setPressedKey('BACKSPACE');
        onKeyPress('BACKSPACE');
      } else if (key === 'ENTER' || key === ' ') {
        setPressedKey('ENTER');
        onKeyPress('ENTER');
      } else if (/^[A-Z]$/.test(key)) {
        setPressedKey(key);
        onKeyPress(key);
      }
      
      setTimeout(() => setPressedKey(null), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const handleClick = (key) => {
    setPressedKey(key);
    onKeyPress(key);
    setTimeout(() => setPressedKey(null), 150);
  };

  const renderKey = (key, isPressed) => {
    return (
      <Button
        key={key}
        onClick={() => handleClick(key)}
        className={`
          keyboard-key
          h-10 min-w-[30px] px-1.5
          sm:h-12 sm:min-w-[36px] sm:px-2
          md:h-14 md:min-w-[40px] md:px-3
          text-lg sm:text-xl font-semibold font-['Space_Grotesk']
          rounded-[var(--radius-key)]
          ${
            isPressed
              ? 'scale-95 bg-primary text-primary-foreground'
              : 'bg-card hover:bg-muted border-border'
          }
        `}
        variant="outline"
      >
        {key}
      </Button>
    );
  };

  return (
    <Card className="p-2 sm:p-3 md:p-4 space-y-2">
      <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
        {/* Row 1 */}
        <div className="flex justify-center gap-0.5 sm:gap-1 md:gap-2">
          {keyboardLayout[0].map(key => renderKey(key, pressedKey === key))}
        </div>
        
        {/* Row 2 */}
        <div className="flex justify-center gap-1 sm:gap-2">
          <div className="w-6 sm:w-8" /> {/* Spacer for offset */}
          {keyboardLayout[1].map(key => renderKey(key, pressedKey === key))}
        </div>
        
        {/* Row 3 */}
        <div className="flex justify-center gap-1 sm:gap-2">
          {keyboardLayout[2].map(key => renderKey(key, pressedKey === key))}
        </div>
        
        {/* Bottom Row */}
        <div className="flex justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
          <Button
            onClick={() => handleClick('BACKSPACE')}
            className={`
              keyboard-key
              h-10 px-3
              sm:h-12 sm:px-4
              md:h-14 md:px-6
              text-xs sm:text-sm font-semibold
              rounded-[var(--radius-key)]
              ${
                pressedKey === 'BACKSPACE'
                  ? 'scale-95 bg-destructive text-destructive-foreground'
                  : 'bg-card hover:bg-muted'
              }
            `}
            variant="outline"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            DELETE
          </Button>
          
          <Button
            onClick={() => handleClick('ENTER')}
            className={`
              keyboard-key
              h-10 px-3
              sm:h-12 sm:px-4
              md:h-14 md:px-6
              text-xs sm:text-sm font-semibold
              rounded-[var(--radius-key)]
              ${
                pressedKey === 'ENTER'
                  ? 'scale-95 bg-primary text-primary-foreground'
                  : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'
              }
            `}
            variant="outline"
          >
            <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            SUBMIT
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-center text-muted-foreground pt-2">
        Use your physical keyboard or click the keys above
      </p>
    </Card>
  );
}