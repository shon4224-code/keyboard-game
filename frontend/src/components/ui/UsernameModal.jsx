import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { Keyboard } from 'lucide-react';
import { toast } from 'sonner';

export default function UsernameModal({ open, onClose }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    setLoading(true);
    const result = await login(username.trim());
    setLoading(false);

    if (result.success) {
      toast.success('Welcome, ' + username + '!');
      onClose();
    } else {
      if (result.error.includes('already taken')) {
        toast.error('Username already taken. Please choose another.');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Keyboard className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Keyboard!</DialogTitle>
          <DialogDescription className="text-center">
            Choose a username to track your progress and compete on the global leaderboards
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
              disabled={loading}
              className="text-center text-lg"
            />
            <p className="text-xs text-muted-foreground text-center">
              3-20 characters • Visible on leaderboards
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Start Playing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
