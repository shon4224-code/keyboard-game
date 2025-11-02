import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from '@/components/InstallPrompt';
import GamePage from '@/pages/GamePage';
import { UserProvider } from '@/contexts/UserContext';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" />
        <InstallPrompt />
      </UserProvider>
    </div>
  );
}

export default App;