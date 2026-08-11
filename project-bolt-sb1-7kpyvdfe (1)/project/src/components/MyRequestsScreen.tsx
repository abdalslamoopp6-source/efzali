import { useState, useEffect } from 'react';
import { supabase, type ServiceRequest, type ServiceRequestStatus } from '@/lib/supabase';
import { services } from '@/lib/services';
import ChatPanel from './ChatPanel';
import {
  Loader2, Clock, CheckCircle2, X, ArrowRight, MessageCircle,
  MapPin, Navigation, User,
} from 'lucide-react';

interface MyRequestsScreenProps {
  userName: string;
  onBack: () => void;
}

const statusConfig: Record<ServiceRequestStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'بانتظار',  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
  accepted:   { label: 'مقبول',   color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30' },
  on_the_way: { label: 'في الطريق', color: 'text-blue-400',  bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  completed:  { label: 'مكتمل',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  cancelled:  { label: 'ملغي',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `قبل ${days} يوم`;
}

export default function MyRequestsScreen({ userName, onBack }: MyRequestsScreenProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('customer_requests_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        () => fetchRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('customer_name', userName)
      .order('created_at', { ascending: false });

    if (data) setRequests(data as ServiceRequest[]);
    setLoading(false);
  };

  const canChat = (status: ServiceRequestStatus) =>
    status === 'accepted' || status === 'on_the_way';

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-400"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-black text-white sm:text-4xl">طلباتي</h1>
            <p className="mt-1 text-sm text-slate-400">تابع حالة طلباتك وتواصل مع مقدم الخدمة</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm">جاري تحميل طلباتك...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">لا توجد طلبات سابقة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const service = services.find((s) => s.key === req.service_key);
              const st = statusConfig[req.status];
              const Icon = service?.icon;

              return (
                <div
                  key={req.id}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in-up"
                >
                  <div className="flex items-center gap-4">
                    {Icon && (
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service?.gradient ?? 'from-slate-600 to-gray-800'} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-white truncate">{req.service_name}</h3>
                        <span className={`shrink-0 rounded-full border ${st.border} ${st.bg} px-2.5 py-0.5 text-xs font-semibold ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(req.created_at)}</span>
                        {req.provider_name && (
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.provider_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {req.provider_name && req.status === 'pending' && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>تم قبول طلبك من <strong>{req.provider_name}</strong></span>
                    </div>
                  )}

                  {canChat(req.status) && (
                    <button
                      onClick={() => setChatRequest(req)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      المحادثة مع {req.provider_name ?? 'مقدم الخدمة'}
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      تم إكمال الطلب
                    </div>
                  )}

                  {req.status === 'cancelled' && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400">
                      <X className="h-4 w-4" />
                      تم إلغاء الطلب
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {chatRequest && (
        <ChatModal
          request={chatRequest}
          userName={userName}
          onClose={() => setChatRequest(null)}
        />
      )}
    </div>
  );
}

function ChatModal({
  request, userName, onClose,
}: {
  request: ServiceRequest;
  userName: string;
  onClose: () => void;
}) {
  const service = services.find((s) => s.key === request.service_key);
  const Icon = service?.icon;

  const openInMaps = () => {
    if (request.latitude && request.longitude) {
      window.open(`https://www.google.com/maps?q=${request.latitude},${request.longitude}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-scale-in" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto animate-slide-up overflow-hidden rounded-t-3xl bg-slate-900 shadow-2xl sm:rounded-3xl sm:m-4">
        <div className={`bg-gradient-to-l ${service?.gradient ?? 'from-slate-600 to-gray-800'} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
              )}
              <div>
                <h2 className="font-display text-lg font-bold text-white">{request.service_name}</h2>
                <p className="text-xs text-white/80">المحادثة مع {request.provider_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30" aria-label="إغلاق">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {request.latitude && request.longitude && (
            <button onClick={openInMaps} className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 py-2.5 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/20">
              <Navigation className="h-4 w-4" />
              عرض موقع مقدم الخدمة على الخريطة
            </button>
          )}

          <ChatPanel
            requestId={request.id}
            senderType="customer"
            senderName={userName}
            recipientName={request.provider_name}
          />
        </div>
      </div>
    </div>
  );
}
