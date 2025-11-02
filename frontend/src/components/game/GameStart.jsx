import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Hash, Zap, Shield } from 'lucide-react';

export default function GameStart({ onStart, dailyWords, difficulty, setDifficulty, streakData }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onStart();
    }
  }, [countdown, onStart]);

  const handleStart = () => {
    setCountdown(3);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full max-w-2xl mx-auto animate-bounce-in">
      <Card className="p-6 sm:p-8 text-center space-y-4 shadow-lg">
        {/* Streak Display */}
        {streakData.currentStreak > 0 && (
          <div className="flex justify-center">
            <Badge className="px-4 py-2 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
              \ud83d\udd25 {streakData.currentStreak} Day Streak!
            </Badge>
          </div>
        )}
        
        {/* Title Section */}
        <div className="space-y-2">
          <div className="inline-block">
            <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
              <Calendar className="w-3 h-3 mr-1.5 inline" />
              {today}
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] tracking-tight">
            Today's Challenge
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Type all 5 words as fast as you can on a randomized keyboard!
          </p>
        </div>

        {/* Words Preview */}
        <div className="space-y-3 py-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Hash className="w-3 h-3" />
            <span className="text-xs font-medium">Today's Words</span>
          </div>
          <div className="flex flex-col gap-2 max-w-md mx-auto">
            {dailyWords.map((word, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-lg font-bold font-['Space_Grotesk'] text-foreground">
                    {word.toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {word.length} letters
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2 pt-2">
          <h3 className="font-semibold text-sm text-center">Choose Difficulty:</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDifficulty('normal')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${difficulty === 'normal' 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Normal</span>
                <span className="text-xs text-muted-foreground text-center">
                  Same keyboard
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setDifficulty('hard')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${difficulty === 'hard' 
                  ? 'border-destructive bg-destructive/10 shadow-md' 
                  : 'border-border hover:border-destructive/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Zap className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-sm text-destructive">Hard</span>
                <span className="text-xs text-muted-foreground text-center">
                  Scrambles each word!
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-3">
          {countdown === null ? (
            <Button
              size="lg"
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-5 text-base font-semibold bg-primary hover:bg-primary/90 animate-pulse-glow"
            >
              <Play className="w-4 h-4 mr-2" />
              START CHALLENGE
            </Button>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-bold font-['Space_Grotesk'] text-primary animate-bounce-in">
                {countdown}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Get ready...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}