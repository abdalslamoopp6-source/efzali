import { useState } from 'react';
import { Shield, ChevronLeft, Phone, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl animate-float-delayed" />
        <div className="absolute -bottom-40 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-float" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Logo badge */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 blur-xl opacity-50" />
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* App name */}
        <h1
          className="font-display text-7xl sm:text-8xl font-black mb-4 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="bg-gradient-to-l from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            أفزع لي
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-slate-300 text-lg sm:text-xl mb-2 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          خدمات الطوارئ على الطريق، في متناول يدك
        </p>

        {/* Decorative line */}
        <div
          className="flex items-center gap-3 mb-10 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <span className="h-px w-12 bg-gradient-to-l from-amber-500 to-transparent" />
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="h-px w-12 bg-gradient-to-r from-amber-500 to-transparent" />
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {['سريع 24/7', 'موثوق', 'احترافي'].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-5 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-12 py-5 text-xl font-bold text-white shadow-2xl shadow-amber-500/30 transition-all duration-300 animate-fade-in-up ${
            isPressed ? 'scale-95' : 'hover:scale-105 hover:shadow-amber-500/50'
          }`}
          style={{ animationDelay: '0.5s' }}
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">ابدأ</span>
          <ChevronLeft className="relative h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </button>

        {/* Phone hint */}
        <div
          className="mt-10 flex items-center gap-2 text-slate-500 text-sm animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>متواجدون لخدمتك في أي وقت</span>
        </div>
      </div>
    </div>
  );
}
