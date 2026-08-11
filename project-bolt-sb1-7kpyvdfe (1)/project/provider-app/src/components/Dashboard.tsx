import { useState, useEffect, useRef } from 'react';
import { supabase, type ServiceRequest, type ServiceRequestStatus } from '@/lib/supabase';
import { services } from '@/lib/services';
import ChatPanel from './ChatPanel';
import {
  Loader2, MapPin, Clock, CheckCircle2, AlertCircle, Navigation,
  X, Phone, User, Inbox, Bell, MessageCircle,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DashboardProps {
  providerName: string;
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

const customerIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background:#f59e0b;border:3px solid #fff;border-radius:50%;width:24px;height:24px;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function Dashboard({ providerName }: DashboardProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [newCount, setNewCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const channel = supabase
      .channel('service_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        () => fetchRequests()
      )
      .subscribe();

    fetchRequests();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('تعذر تحميل الطلبات');
    } else {
      const rows = data as ServiceRequest[];
      const pendingNow = rows.filter((r) => r.status === 'pending').length;
      if (pendingNow > prevCountRef.current && prevCountRef.current > 0) {
        setNewCount((n) => n + (pendingNow - prevCountRef.current));
      }
      prevCountRef.current = pendingNow;
      setRequests(rows);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: ServiceRequestStatus) => {
    const update: Record<string, unknown> = { status };
    if (status === 'accepted') update.provider_name = providerName;

    const { error } = await supabase.from('service_requests').update(update).eq('id', id);
    if (!error) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status, provider_name: status === 'accepted' ? providerName : r.provider_name } : r)));
      setSelectedRequest((prev) => (prev ? { ...prev, status, provider_name: status === 'accepted' ? providerName : prev.provider_name } : null));
    }
  };

  const filteredRequests = filter === 'active'
    ? requests.filter((r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'on_the_way')
    : requests;

  const activeCount = requests.filter((r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'on_the_way').length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            {newCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 animate-scale-in">
                <Bell className="h-3.5 w-3.5" />
                {newCount} طلب جديد
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl mt-2">
            لوحة التحكم
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            مرحباً <span className="font-semibold text-sky-400">{providerName}</span> — لديك{' '}
            <span className="font-bold text-amber-400">{pendingCount}</span> طلب جديد
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="الطلبات الجديدة" value={pendingCount} color="amber" />
          <StatCard label="الطلبات النشطة" value={activeCount} color="sky" />
          <StatCard label="إجمالي الطلبات" value={requests.length} color="slate" />
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-2">
          <FilterTab label="الطلبات النشطة" count={activeCount} active={filter === 'active'} onClick={() => setFilter('active')} />
          <FilterTab label="الكل" count={requests.length} active={filter === 'all'} onClick={() => setFilter('all')} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-400" />
            <p className="text-sm">جاري تحميل الطلبات...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">لا توجد طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => {
              const service = services.find((s) => s.key === req.service_key);
              const st = statusConfig[req.status];
              const Icon = service?.icon;

              return (
                <button
                  key={req.id}
                  onClick={() => { setSelectedRequest(req); setNewCount(0); }}
                  className="group w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-right backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900 animate-fade-in-up"
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
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.customer_name}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(req.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          providerName={providerName}
          onClose={() => setSelectedRequest(null)}
          onUpdateStatus={(status) => updateStatus(selectedRequest.id, status)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'amber' | 'sky' | 'slate' }) {
  const colors = {
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    sky: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
    slate: 'text-slate-300 border-slate-700 bg-slate-800/30',
  };
  return (
    <div className={`rounded-xl border ${colors[color]} p-3 text-center`}>
      <p className={`font-display text-2xl font-black ${colors[color].split(' ')[0]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
          : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-500'}`}>{count}</span>
    </button>
  );
}

function RequestDetailModal({
  request, providerName, onClose, onUpdateStatus,
}: {
  request: ServiceRequest;
  providerName: string;
  onClose: () => void;
  onUpdateStatus: (status: ServiceRequestStatus) => void;
}) {
  const [showChat, setShowChat] = useState(false);
  const canChat = request.status === 'accepted' || request.status === 'on_the_way';
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const service = services.find((s) => s.key === request.service_key);
  const Icon = service?.icon;
  const st = statusConfig[request.status];

  const hasCoords = request.latitude !== null && request.longitude !== null;

  useEffect(() => {
    if (!hasCoords || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [request.latitude!, request.longitude!],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker([request.latitude!, request.longitude!], { icon: customerIcon }).addTo(map);
    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [hasCoords, request.latitude, request.longitude]);

  const openInMaps = () => {
    if (hasCoords) {
      window.open(`https://www.google.com/maps?q=${request.latitude},${request.longitude}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-scale-in" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto animate-slide-up overflow-hidden rounded-t-3xl bg-slate-900 shadow-2xl sm:rounded-3xl sm:m-4">
        {/* Header */}
        <div className={`bg-gradient-to-l ${service?.gradient ?? 'from-slate-600 to-gray-800'} p-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
              )}
              <div>
                <h2 className="font-display text-xl font-bold text-white">{request.service_name}</h2>
                <span className="text-sm text-white/80">{st.label} — {timeAgo(request.created_at)}</span>
              </div>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Customer info */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20">
                <User className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">اسم العميل</p>
                <p className="font-semibold text-white">{request.customer_name}</p>
              </div>
            </div>
            {request.phone && (
              <div className="mt-3 flex items-center gap-3 border-t border-slate-700/50 pt-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">رقم الهاتف</p>
                  <p className="font-semibold text-white" dir="ltr">{request.phone}</p>
                </div>
              </div>
            )}
            {request.notes && (
              <div className="mt-3 border-t border-slate-700/50 pt-3">
                <p className="text-xs text-slate-500 mb-1">ملاحظات</p>
                <p className="text-sm text-slate-300">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Location / Map */}
          {hasCoords ? (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">موقع العميل</p>
              <div className="relative h-52 w-full overflow-hidden rounded-xl border border-slate-700">
                <div ref={mapRef} className="h-full w-full" />
              </div>
              <button onClick={openInMaps} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 py-2.5 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/20">
                <Navigation className="h-4 w-4" />
                فتح في خرائط جوجل
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500" dir="ltr">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                {request.latitude!.toFixed(5)}, {request.longitude!.toFixed(5)}
              </p>
            </div>
          ) : request.location ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <MapPin className="h-4 w-4 text-amber-400" />
                الموقع
              </p>
              <p className="text-sm text-slate-400">{request.location}</p>
            </div>
          ) : null}

          {/* Status actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-300">تحديث حالة الطلب</p>
            <div className="grid grid-cols-2 gap-2">
              {request.status === 'pending' && (
                <ActionButton label="قبول الطلب" icon={<CheckCircle2 className="h-4 w-4" />} color="sky" onClick={() => onUpdateStatus('accepted')} />
              )}
              {request.status === 'accepted' && (
                <ActionButton label="في الطريق" icon={<Navigation className="h-4 w-4" />} color="blue" onClick={() => onUpdateStatus('on_the_way')} />
              )}
              {request.status === 'on_the_way' && (
                <ActionButton label="إكمال" icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" onClick={() => onUpdateStatus('completed')} />
              )}
              {(request.status === 'pending' || request.status === 'accepted' || request.status === 'on_the_way') && (
                <ActionButton label="إلغاء" icon={<X className="h-4 w-4" />} color="red" onClick={() => onUpdateStatus('cancelled')} />
              )}
              {request.status === 'completed' && (
                <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  تم إكمال هذا الطلب
                </div>
              )}
              {request.status === 'cancelled' && (
                <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400">
                  <X className="h-4 w-4" />
                  تم إلغاء هذا الطلب
                </div>
              )}
            </div>
          </div>

          {/* Chat */}
          {canChat && (
            <div className="space-y-2">
              {!showChat ? (
                <button
                  onClick={() => setShowChat(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 py-2.5 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  المحادثة مع العميل
                </button>
              ) : (
                <ChatPanel
                  requestId={request.id}
                  senderType="provider"
                  senderName={providerName}
                  recipientName={request.customer_name}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, color, onClick }: { label: string; icon: React.ReactNode; color: 'sky' | 'blue' | 'emerald' | 'red'; onClick: () => void }) {
  const colors = {
    sky: 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20',
    blue: 'border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    red: 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl border ${colors[color]} py-3 text-sm font-semibold transition-colors`}>
      {icon}
      {label}
    </button>
  );
}
