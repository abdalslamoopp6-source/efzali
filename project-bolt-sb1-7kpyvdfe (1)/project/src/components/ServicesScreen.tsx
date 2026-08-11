import { useState } from 'react';
import { services } from '@/lib/services';
import ServiceCard from './ServiceCard';
import RequestModal from './RequestModal';
import type { Service } from '@/lib/services';
import { ArrowRight } from 'lucide-react';

interface ServicesScreenProps {
  onBack: () => void;
}

export default function ServicesScreen({ onBack }: ServicesScreenProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 sm:px-6 sm:py-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-400"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
              خدماتنا
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              اختر الخدمة التي تحتاجها واطلبها فوراً
            </p>
          </div>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              service={service}
              index={index}
              onRequest={() => setSelectedService(service)}
            />
          ))}
        </div>
      </div>

      {/* Request modal */}
      {selectedService && (
        <RequestModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
