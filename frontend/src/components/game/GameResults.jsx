import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, TrendingUp, Share2, RotateCcw, Copy, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { generateShareText, generateTwitterShare, copyToClipboard } from '@/utils/shareGenerator';
import { getStreakMilestone } from '@/utils/streakManager';
import { useState } from 'react';

export default function GameResults({ completionTime, stats, streakData, difficulty, onPlayAgain }) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isNewBest = stats.bestTime === completionTime;
  const milestone = getStreakMilestone(streakData.currentStreak);
  const wpmRating = getWPMRating(stats.wpm || 0);
  const accuracyRating = getAccuracyRating(stats.accuracy || 100);
  
  const handleCopyShare = async () => {
    const shareText = generateShareText({
      completionTime,
      difficulty,
      streak: streakData.currentStreak,
      wordsCompleted: 5
    });
    
    const success = await copyToClipboard(shareText);
    if (success) {
      toast.success('Results copied to clipboard!');
    } else {
      toast.error('Could not copy to clipboard');
    }
  };
  
  const handleTwitterShare = () => {
    const twitterUrl = generateTwitterShare({
      completionTime,
      difficulty,
      streak: streakData.currentStreak
    });
    window.open(twitterUrl, '_blank');
  };

  const handleShare = async () => {
    const shareText = `I completed today's keyboard challenge in ${formatTime(completionTime)}! 🎉\n\nCan you beat my time?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'keyboard Challenge',
          text: shareText
        });
        toast.success('Results shared!');
      } catch (err) {
        // User cancelled or share failed, no action needed
        if (err.name !== 'AbortError') {
          copyToClipboardFallback(shareText);
        }
      }
    } else {
      copyToClipboardFallback(shareText);
    }
  };
  
  const copyToClipboardFallback = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    } catch (err) {
      // Clipboard API failed, create a fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast.success('Results copied to clipboard!');
      } catch (e) {
        toast.info('Share text: ' + text);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-bounce-in">
      <Card className="p-8 sm:p-12 text-center space-y-8">
        {/* Success Icon with Milestone */}
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

        {/* Streak Milestone Celebration */}
        {milestone && (
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border-2 border-orange-500/50">
            <p className="text-2xl font-bold">{milestone.emoji} {milestone.message}</p>
            <p className="text-sm text-muted-foreground mt-1">{streakData.currentStreak} day streak achieved!</p>
          </div>
        )}

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
            <div className="flex items-center gap-2 justify-center mb-2">
              <p className="text-sm text-muted-foreground">Your Time</p>
              {difficulty === 'hard' && (
                <Badge variant="destructive" className="text-xs">Hard Mode</Badge>
              )}
            </div>
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
            <div className="text-3xl mx-auto">🔥</div>
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {streakData.currentStreak}
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

        {/* Share Options */}
        {!showShareOptions ? (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowShareOptions(true)}
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
        ) : (
          <div className="space-y-3 pt-4">
            <p className="text-sm font-semibold">Share your achievement:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCopyShare}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </Button>
              <Button
                onClick={handleTwitterShare}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
            <Button
              onClick={() => setShowShareOptions(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

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