import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, TrendingUp, Share2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function GameResults({ completionTime, stats, onPlayAgain }) {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isNewBest = stats.bestTime === completionTime;

  const handleShare = () => {
    const shareText = `I completed today's keyboard challenge in ${formatTime(completionTime)}! 🎉\n\nCan you beat my time? Play at [Your URL]`;
    
    if (navigator.share) {
      navigator.share({
        title: 'keyboard Challenge',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-bounce-in">
      <Card className="p-8 sm:p-12 text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-pulse-glow">
              <Trophy className="w-12 h-12 text-success" />
            </div>
            {isNewBest && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground animate-bounce-in">
                NEW BEST!
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-4xl sm:text-5xl font-bold font-['Space_Grotesk'] tracking-tight">
            Challenge Complete!
          </h2>
          <p className="text-lg text-muted-foreground">
            Great job! Here's how you did:
          </p>
        </div>

        {/* Main Time Display */}
        <div className="py-6">
          <div className="inline-block">
            <p className="text-sm text-muted-foreground mb-2">Your Time</p>
            <div className="text-6xl sm:text-7xl font-bold font-['Space_Grotesk'] tabular-nums text-primary">
              {formatTime(completionTime)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 space-y-2">
            <Clock className="w-6 h-6 text-primary mx-auto" />
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {formatTime(stats.bestTime)}
            </p>
            <p className="text-xs text-muted-foreground">Best Time</p>
          </Card>

          <Card className="p-4 space-y-2">
            <TrendingUp className="w-6 h-6 text-secondary mx-auto" />
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {stats.streak}
            </p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>

          <Card className="p-4 space-y-2">
            <Trophy className="w-6 h-6 text-accent mx-auto" />
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {stats.gamesPlayed}
            </p>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </Button>
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            New Challenge
          </Button>
        </div>

        {/* Next challenge info */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Next challenge available at midnight
          </p>
        </div>
      </Card>
    </div>
  );
}