import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, TrendingUp, Share2, RotateCcw, Download, Users, Award } from 'lucide-react';
import { toast } from 'sonner';
import { getStreakMilestone } from '@/utils/streakManager';
import { generateResultCard, shareResultCard, downloadResultCard } from '@/utils/resultCardGenerator';
import { createChallenge, checkAchievements, getAllAchievements } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import { useState, useEffect } from 'react';

export default function GameResults({ completionTime, stats, streakData, difficulty, gameMode, triviaResults, onPlayAgain }) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [generatingCard, setGeneratingCard] = useState(false);
  const { user } = useUser();
  
  // Check for new achievements on mount
  useEffect(() => {
    if (user) {
      checkForAchievements();
      loadAchievements();
    }
  }, [user]);
  
  const checkForAchievements = async () => {
    const gameData = {
      wpm: stats.wpm || 0,
      accuracy: stats.accuracy || 0,
      mode: gameMode,
      score: triviaResults?.correctCount || 0,
      streak: stats.streak || 0
    };
    
    const result = await checkAchievements(user.id, gameData);
    if (result.success && result.data.new_achievements.length > 0) {
      setNewAchievements(result.data.new_achievements);
      toast.success(`🏆 Achievement Unlocked!`);
    }
  };
  
  const loadAchievements = async () => {
    const result = await getAllAchievements();
    if (result.success) {
      setAllAchievements(result.data);
    }
  };
  
  const getAchievementData = (achievementId) => {
    return allAchievements.find(a => a.id === achievementId);
  };
  
  const handleShareCard = async () => {
    setGeneratingCard(true);
    try {
      const achievement = newAchievements.length > 0 ? getAchievementData(newAchievements[0]) : null;
      
      const cardData = {
        wpm: stats.wpm || 0,
        accuracy: stats.accuracy || 0,
        mode: gameMode,
        difficulty: difficulty || '',
        score: triviaResults?.correctCount || 0,
        streak: stats.streak || 0,
        username: user?.username || 'Player',
        achievement: achievement ? achievement.name : null
      };
      
      const blob = await generateResultCard(cardData);
      const result = await shareResultCard(blob, cardData);
      
      if (result.success) {
        if (result.fallback) {
          toast.success('Result card downloaded!');
        } else {
          toast.success('Shared successfully!');
        }
      }
    } catch (error) {
      toast.error('Failed to generate result card');
    }
    setGeneratingCard(false);
  };
  
  const handleCreateChallenge = async () => {
    if (!user) {
      toast.error('Please log in to create challenges');
      return;
    }
    
    try {
      const challengeData = {
        challenger_username: user.username,
        mode: gameMode,
        difficulty: difficulty || 'normal',
        wpm: stats.wpm || 0,
        accuracy: stats.accuracy || 0,
        time_seconds: completionTime / 1000,
        score: triviaResults?.correctCount || 0
      };
      
      const result = await createChallenge(challengeData);
      if (result.success) {
        const challengeUrl = `${window.location.origin}?challenge=${result.data.id}`;
        await navigator.clipboard.writeText(challengeUrl);
        toast.success('Challenge link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to create challenge');
    }
  };
  
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatWPM = (wpm) => Math.round(wpm);
  
  const formatAccuracy = (accuracy) => Math.round(accuracy);
  
  const getWPMRating = (wpm) => {
    if (wpm >= 80) return { label: 'Lightning Fast', color: 'text-purple-500', emoji: '⚡' };
    if (wpm >= 60) return { label: 'Very Fast', color: 'text-blue-500', emoji: '🚀' };
    if (wpm >= 40) return { label: 'Fast', color: 'text-green-500', emoji: '💨' };
    if (wpm >= 25) return { label: 'Good', color: 'text-yellow-500', emoji: '👍' };
    return { label: 'Keep Practicing', color: 'text-orange-500', emoji: '📚' };
  };
  
  const getAccuracyRating = (accuracy) => {
    if (accuracy >= 98) return { label: 'Perfect', color: 'text-purple-500' };
    if (accuracy >= 95) return { label: 'Excellent', color: 'text-green-500' };
    if (accuracy >= 90) return { label: 'Great', color: 'text-blue-500' };
    if (accuracy >= 85) return { label: 'Good', color: 'text-yellow-500' };
    return { label: 'Needs Work', color: 'text-orange-500' };
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

        {/* Main Time Display with WPM */}
        <div className="py-6">
          <div className="inline-block">
            <div className="flex items-center gap-2 justify-center mb-2">
              <p className="text-sm text-muted-foreground">Your Time</p>
              {['hard', 'insane'].includes(difficulty) && (
                <Badge variant="destructive" className="text-xs">
                  {difficulty === 'insane' ? 'INSANE' : 'Hard'} Mode
                </Badge>
              )}
            </div>
            <div className="text-6xl sm:text-7xl font-bold font-['Space_Grotesk'] tabular-nums text-primary">
              {formatTime(completionTime)}
            </div>
            
            {/* WPM & Accuracy Display */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatWPM(stats.wpm || 0)}</p>
                <p className={`text-xs ${wpmRating.color} font-medium`}>
                  {wpmRating.emoji} {wpmRating.label}
                </p>
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatAccuracy(stats.accuracy || 100)}</p>
                <p className={`text-xs ${accuracyRating.color} font-medium`}>
                  {accuracyRating.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3 space-y-1">
            <Clock className="w-5 h-5 text-primary mx-auto" />
            <p className="text-xl font-bold font-['Space_Grotesk']">
              {formatTime(stats.bestTime)}
            </p>
            <p className="text-xs text-muted-foreground">Best</p>
          </Card>

          <Card className="p-3 space-y-1">
            <div className="text-2xl mx-auto">🔥</div>
            <p className="text-xl font-bold font-['Space_Grotesk']">
              {streakData.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </Card>

          <Card className="p-3 space-y-1">
            <Zap className="w-5 h-5 text-accent mx-auto" />
            <p className="text-xl font-bold font-['Space_Grotesk']">
              {stats.wpm || 0}
            </p>
            <p className="text-xs text-muted-foreground">WPM</p>
          </Card>

          <Card className="p-3 space-y-1">
            <Target className="w-5 h-5 text-success mx-auto" />
            <p className="text-xl font-bold font-['Space_Grotesk']">
              {stats.accuracy || 100}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
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