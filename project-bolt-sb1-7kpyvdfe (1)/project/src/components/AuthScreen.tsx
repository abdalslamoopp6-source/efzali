import { useState } from 'react';
import { Shield, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (name: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      localStorage.setItem('user_name', name.trim());
      onAuthSuccess(name.trim());
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 blur-xl opacity-50" />
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="font-display text-5xl font-black mb-2">
            <span className="bg-gradient-to-l from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              أفزع لي
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            أدخل اسمك للبدء
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                الاسم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسمك"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pr-11 pl-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-slate-800 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 py-3.5 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  دخول
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
