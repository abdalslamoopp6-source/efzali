import { useState, useEffect } from 'react';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import { LogOut } from 'lucide-react';

export default function App() {
  const [providerName, setProviderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('provider_name');
    if (stored) setProviderName(stored);
    setLoading(false);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('provider_name');
    setProviderName(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!providerName) {
    return <LoginScreen onLogin={(name) => setProviderName(name)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <button
        onClick={handleSignOut}
        className="fixed left-4 top-4 z-40 flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:border-red-500/50 hover:text-red-400"
      >
        <LogOut className="h-4 w-4" />
        خروج
      </button>
      <Dashboard providerName={providerName} />
    </div>
  );
}
