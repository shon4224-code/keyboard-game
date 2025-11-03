import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Crown, X, Loader2 } from 'lucide-react';
import { getLeaderboardRankings } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export default function Leaderboard({ onClose }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all-time');
  const [mode, setMode] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const { user } = useUser();

  useEffect(() => {
    fetchRankings();
  }, [period, mode, difficulty]);

  const fetchRankings = async () => {
    setLoading(true);
    const filters = { period, limit: 50 };
    if (mode !== 'all') filters.mode = mode;
    if (difficulty !== 'all') filters.difficulty = difficulty;

    const result = await getLeaderboardRankings(filters);
    if (result.success) {
      setRankings(result.data);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Global Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Compete with players worldwide</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-muted/30">
          <Tabs value={period} onValueChange={setPeriod} className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="trivia">Trivia</SelectItem>
                <SelectItem value="sprint">Sprint</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="insane">Insane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rankings List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No rankings yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rankings.map((entry, index) => {
                const isCurrentUser = user && entry.user_id === user.id;
                return (
                  <Card 
                    key={entry.id} 
                    className={`p-4 flex items-center justify-between ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {entry.username}
                            {isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.mode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {entry.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">
                          {entry.wpm.toFixed(1)} WPM
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.accuracy.toFixed(1)}% • {formatTime(entry.time_seconds)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
