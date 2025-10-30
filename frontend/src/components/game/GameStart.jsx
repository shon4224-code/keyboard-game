import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Hash } from 'lucide-react';

export default function GameStart({ onStart, dailyWords }) {
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
      <Card className="p-8 sm:p-12 text-center space-y-6 shadow-lg">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="inline-block">
            <Badge variant="outline" className="px-4 py-1 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2 inline" />
              {today}
            </Badge>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-['Space_Grotesk'] tracking-tight">
            Today's Challenge
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Type all 5 words as fast as you can on a randomized keyboard!
          </p>
        </div>

        {/* Words Preview */}
        <div className="space-y-4 py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span className="text-sm font-medium">Today's Words</span>
          </div>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {dailyWords.map((word, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-foreground">
                    {word.toUpperCase()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {word.length} letters
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-left">
          <h3 className="font-semibold text-sm">How to Play:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click START to begin the timer</li>
            <li>• Type each word in order using the randomized keyboard</li>
            <li>• Press ENTER or SPACE to submit each word</li>
            <li>• Complete all 5 words to stop the timer</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          {countdown === null ? (
            <Button
              size="lg"
              onClick={handleStart}
              className="w-full sm:w-auto px-12 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 animate-pulse-glow"
            >
              <Play className="w-5 h-5 mr-2" />
              START CHALLENGE
            </Button>
          ) : (
            <div className="text-center">
              <div className="text-7xl font-bold font-['Space_Grotesk'] text-primary animate-bounce-in">
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