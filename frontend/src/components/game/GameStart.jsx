import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Hash, Zap, Shield, Flame, Quote, Brain, Timer } from 'lucide-react';

export default function GameStart({ onStart, dailyWords, dailyQuote, triviaQuestions = [], difficulty, setDifficulty, gameMode, setGameMode, streakData }) {
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

  const difficultyInfo = {
    easy: { words: 3, letters: '3-5', scramble: 'No scrambling', color: 'text-green-500', icon: Shield },
    normal: { words: 5, letters: '4-8', scramble: 'Same keyboard', color: 'text-blue-500', icon: Shield },
    hard: { words: 5, letters: '4-8', scramble: 'Scrambles each word', color: 'text-orange-500', icon: Zap },
    insane: { words: 7, letters: '5-9', scramble: 'Scrambles each word', color: 'text-red-500', icon: Flame }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-bounce-in">
      <Card className="p-6 sm:p-8 text-center space-y-4 shadow-lg">
        {/* Streak Display */}
        {streakData.currentStreak > 0 && (
          <div className="flex justify-center">
            <Badge className="px-4 py-2 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
              🔥 {streakData.currentStreak} Day Streak!
            </Badge>
          </div>
        )}
        
        {/* Title Section */}
        <div className="space-y-3">
          <div className="inline-block">
            <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
              <Calendar className="w-3 h-3 mr-1.5 inline" />
              {today}
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] tracking-tight">
            Today's Challenge
          </h2>
          <p className="text-lg sm:text-xl font-bold text-primary">
            Think fast. Type faster. Conquer the chaos.
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose your mode and difficulty!
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-2 pt-2">
          <h3 className="font-semibold text-sm text-center">Choose Mode:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setGameMode('words')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  gameMode === 'words'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Hash className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Words</span>
                <span className="text-xs text-muted-foreground">
                  Type {difficultyInfo[difficulty].words} words
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setGameMode('quote')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  gameMode === 'quote'
                    ? 'border-accent bg-accent/10 shadow-md'
                    : 'border-border hover:border-accent/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Quote className="w-5 h-5 text-accent" />
                <span className="font-semibold text-sm">Quote</span>
                <span className="text-xs text-muted-foreground">
                  Type a sentence
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setGameMode('trivia')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  gameMode === 'trivia'
                    ? 'border-purple-500 bg-purple-500/10 shadow-md'
                    : 'border-border hover:border-purple-500/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-sm">Trivia</span>
                <span className="text-xs text-muted-foreground">
                  5 questions
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setGameMode('sprint')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  gameMode === 'sprint'
                    ? 'border-orange-500 bg-orange-500/10 shadow-md'
                    : 'border-border hover:border-orange-500/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Timer className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-sm">Sprint</span>
                <span className="text-xs text-muted-foreground">
                  60 seconds
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Preview */}
        {gameMode === 'words' ? (
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
        ) : gameMode === 'quote' ? (
          <div className="space-y-3 py-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Quote className="w-3 h-3" />
              <span className="text-xs font-medium">Today's Quote</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-base italic text-foreground">
                "{dailyQuote}"
              </p>
            </div>
          </div>
        ) : gameMode === 'trivia' ? (
          <div className="space-y-3 py-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Brain className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium">Today's Trivia Challenge</span>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-foreground text-center font-medium mb-2">
                Answer 5 general knowledge questions
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Type full answers • Score = Speed + Accuracy + Streak Bonuses
              </p>
              {triviaQuestions.length > 0 && (
                <div className="mt-3 text-center">
                  <Badge variant="secondary" className="text-xs">
                    {triviaQuestions.length} questions loaded
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Timer className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-medium">Sprint Challenge</span>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-foreground text-center font-medium mb-2">
                Type as many words as you can in 60 seconds!
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Keyboard scrambles after each word • One difficulty level
              </p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <Badge variant="secondary" className="text-xs">
                  <Timer className="w-3 h-3 mr-1" />
                  60 sec timer
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Jumbled keys
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Selection - Only for words mode */}
        {gameMode === 'words' && (
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-sm text-center">Choose Difficulty:</h3>
            <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDifficulty('easy')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  difficulty === 'easy'
                    ? 'border-green-500 bg-green-500/10 shadow-md'
                    : 'border-border hover:border-green-500/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">Easy</span>
                <span className="text-xs text-muted-foreground text-center">
                  3 words, no scramble
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setDifficulty('normal')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  difficulty === 'normal'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Normal</span>
                <span className="text-xs text-muted-foreground text-center">
                  5 words, same keyboard
                </span>
              </div>
            </button>

            <button
              onClick={() => setDifficulty('hard')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  difficulty === 'hard'
                    ? 'border-destructive bg-destructive/10 shadow-md'
                    : 'border-border hover:border-destructive/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Zap className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-sm text-destructive">Hard</span>
                <span className="text-xs text-muted-foreground text-center">
                  5 words, scrambles!
                </span>
              </div>
            </button>

            <button
              onClick={() => setDifficulty('insane')}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${
                  difficulty === 'insane'
                    ? 'border-red-500 bg-red-500/10 shadow-md'
                    : 'border-border hover:border-red-500/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-sm text-red-500">Insane</span>
                <span className="text-xs text-muted-foreground text-center">
                  7 words, scrambles!
                </span>
              </div>
            </button>
          </div>
        </div>
        )}

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