import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from '@/components/InstallPrompt';
import GamePage from '@/pages/GamePage';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
      <InstallPrompt />
    </div>
  );
}

export default App;