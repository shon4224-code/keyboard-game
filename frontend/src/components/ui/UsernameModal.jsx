import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { getUserByUsername } from '@/utils/api';
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
    
    // First try to register
    const result = await login(username.trim());

    if (result.success) {
      setLoading(false);
      toast.success('Welcome, ' + username + '!');
      onClose();
    } else {
      // If username is taken, try to log in with existing username
      if (result.error.includes('already taken')) {
        toast.info('Username exists. Logging you in...');
        
        try {
          const userResult = await getUserByUsername(username.trim());
          if (userResult.success) {
            localStorage.setItem('keyboard_user_id', userResult.data.id);
            localStorage.setItem('keyboard_username', userResult.data.username);
            setLoading(false);
            toast.success('Welcome back, ' + username + '!');
            window.location.reload();
          } else {
            setLoading(false);
            toast.error('Could not log in. Please try a different username.');
          }
        } catch (error) {
          setLoading(false);
          toast.error('Login failed. Please try again.');
        }
      } else {
        setLoading(false);
        toast.error('Failed to register. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing the modal if user hasn't registered yet
      if (!isOpen && !loading) {
        const storedUserId = localStorage.getItem('keyboard_user_id');
        if (storedUserId) {
          onClose();
        }
      }
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        // Prevent closing by clicking outside if no user is registered
        const storedUserId = localStorage.getItem('keyboard_user_id');
        if (!storedUserId) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Keyboard className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Keyboard!</DialogTitle>
          <DialogDescription className="text-center">
            Enter your username to track your progress and compete on leaderboards. If you have played before, enter your existing username to continue.
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
              3-20 characters • New or existing username
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
