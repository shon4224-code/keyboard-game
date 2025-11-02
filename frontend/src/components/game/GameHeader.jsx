import { Trophy, Zap, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GameHeader({ stats, onShowLeaderboard }) {
  const formatTime = (ms) => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">K</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] tracking-tight">
                keyboard
              </h1>
              <p className="text-xs text-muted-foreground">Daily Typing Challenge</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onShowLeaderboard && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onShowLeaderboard}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            )}
            
            <Card className="px-3 py-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="text-sm font-semibold">{formatTime(stats.bestTime)}</p>
              </div>
            </Card>

            <Card className="px-3 py-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-sm font-semibold">{stats.streak || 0}</p>
              </div>
            </Card>

            <Card className="px-3 py-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Played</p>
                <p className="text-sm font-semibold">{stats.gamesPlayed || 0}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </header>
  );
}

export const GameHeaderSkeleton = () => (
  <header className="border-b bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        <div className="flex gap-3">
          <div className="h-16 w-24 bg-muted animate-pulse rounded" />
          <div className="h-16 w-24 bg-muted animate-pulse rounded" />
          <div className="h-16 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  </header>
);