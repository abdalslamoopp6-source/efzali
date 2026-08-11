import { type Service } from '@/lib/services';
import { ArrowLeft } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  index: number;
  onRequest: () => void;
}

export default function ServiceCard({ service, index, onRequest }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Hover gradient glow */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 blur transition-opacity duration-300 group-hover:opacity-20`}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-white">
              {service.name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {service.description}
            </p>
          </div>
        </div>
      </div>

      {/* Request button */}
      <button
        onClick={onRequest}
        className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-transparent hover:text-white group-hover:border-transparent"
      >
        <span
          className={`absolute inset-0 rounded-xl bg-gradient-to-l ${service.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />
        <span className="relative">طلب الخدمة</span>
        <ArrowLeft className="relative h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
      </button>
    </div>
  );
}
