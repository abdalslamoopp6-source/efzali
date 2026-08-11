import { useState, useEffect } from 'react';
import AuthScreen from '@/components/AuthScreen';
import HomeScreen from '@/components/HomeScreen';
import ServicesScreen from '@/components/ServicesScreen';
import MyRequestsScreen from '@/components/MyRequestsScreen';
import { LogOut, ClipboardList } from 'lucide-react';

type Screen = 'home' | 'services' | 'my_requests';

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
    setLoading(false);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user_name');
    setUserName(null);
    setScreen('home');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!userName) {
    return <AuthScreen onAuthSuccess={(name) => setUserName(name)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed left-4 top-4 z-40 flex gap-2">
        {screen !== 'home' && (
          <button
            onClick={() => setScreen('my_requests')}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium backdrop-blur-sm transition-colors ${
              screen === 'my_requests'
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-amber-500/50 hover:text-amber-400'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            طلباتي
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>

      {screen === 'home' ? (
        <HomeScreen onStart={() => setScreen('services')} />
      ) : screen === 'services' ? (
        <ServicesScreen onBack={() => setScreen('home')} />
      ) : (
        <MyRequestsScreen userName={userName} onBack={() => setScreen('services')} />
      )}
    </div>
  );
}
