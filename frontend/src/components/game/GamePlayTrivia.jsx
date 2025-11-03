import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RandomKeyboard from '@/components/game/RandomKeyboard';
import { Timer, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { checkAnswer } from '@/utils/triviaHelper';
import { toast } from 'sonner';

export default function GamePlayTrivia({
  questions,
  startTime,
  onComplete
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [keyboardKey, setKeyboardKey] = useState(0);

  // Safety check for questions
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-muted-foreground">Loading trivia questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    const isCorrect = checkAnswer(
      userAnswer,
      currentQuestion.answer,
      currentQuestion.alternative_answers
    );

    // Update answers array
    const newAnswer = {
      question: currentQuestion.question,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQuestion.answer,
      isCorrect
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Update stats
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
      toast.success('Correct!', {
        icon: <CheckCircle2 className="w-4 h-4 text-success" />
      });
    } else {
      setStreak(0);
      toast.error(`Wrong! Answer: ${currentQuestion.answer}`, {
        icon: <XCircle className="w-4 h-4 text-destructive" />
      });
    }

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setKeyboardKey(prev => prev + 1); // Randomize keyboard for next question
      }, 1000);
    } else {
      setTimeout(() => {
        onComplete({
          answers: [...answers, newAnswer],
          correctCount: isCorrect ? correctCount + 1 : correctCount,
          totalQuestions: questions.length,
          timeSeconds: elapsedTime / 1000,
          maxStreak: Math.max(maxStreak, isCorrect ? streak + 1 : streak)
        });
      }, 1000);
    }
  }, [userAnswer, currentQuestion, currentQuestionIndex, questions, answers, correctCount, streak, maxStreak, elapsedTime, onComplete]);

  // Handle keyboard key press
  const handleKeyPress = useCallback((key) => {
    if (key === 'BACKSPACE') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setUserAnswer(prev => prev + ' ');
    } else if (key === 'ENTER') {
      handleSubmit();
    } else {
      // Regular letter key
      setUserAnswer(prev => prev + key);
    }
  }, [handleSubmit]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-flip-in">
      {/* Timer and Progress */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold font-['Space_Grotesk'] tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <Badge variant="default" className="text-xs font-medium gap-1">
                <Zap className="w-3 h-3" />
                {streak} Streak
              </Badge>
            )}
            <Badge variant="outline" className="text-sm font-medium px-3 py-1">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question Card */}
      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {currentQuestion.category}
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {currentQuestion.question}?
            </h3>
            <p className="text-sm text-muted-foreground">
              Type your answer using the keyboard below
            </p>
          </div>

          {/* Answer Display */}
          <div className="bg-muted/30 rounded-lg p-4 min-h-[60px] flex items-center">
            <p className="text-lg font-mono break-words w-full">
              {userAnswer || <span className="text-muted-foreground italic">Start typing...</span>}
              <span className="animate-pulse">|</span>
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>{correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span>{currentQuestionIndex - correctCount} Wrong</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Best: {maxStreak}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Randomized Keyboard */}
      <RandomKeyboard 
        onKeyPress={handleKeyPress}
        currentWord={userAnswer}
        typedText={userAnswer}
        keyboardKey={keyboardKey}
      />
    </div>
  );
}
