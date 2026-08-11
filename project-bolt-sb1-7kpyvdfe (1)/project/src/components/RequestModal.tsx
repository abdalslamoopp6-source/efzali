import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Service } from '@/lib/services';
import { supabase, type NewServiceRequest } from '@/lib/supabase';
import {
  X,
  User,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Info,
  Settings,
} from 'lucide-react';

interface RequestModalProps {
  service: Service;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type GeoState = 'idle' | 'locating' | 'error' | 'denied';

interface Coordinates {
  lat: number;
  lng: number;
}

const DEFAULT_CENTER: Coordinates = { lat: 24.7136, lng: 46.6753 };

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background:#f59e0b;border:3px solid #fff;border-radius:50%;width:24px;height:24px;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function RequestModal({ service, onClose }: RequestModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [geoError, setGeoError] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const Icon = service.icon;

  // Initialize map immediately on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 10,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Click on map → place marker and set coords
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Add / move marker when coords change
  useEffect(() => {
    if (!coords || !mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = L.marker([coords.lat, coords.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current);
    }
  }, [coords]);

  const requestLocation = () => {
    setGeoState('locating');
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoState('error');
      setGeoError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(newCoords);
          setGeoState('idle');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newCoords.lat, newCoords.lng], 15, { animate: true });
            setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
          }
        },
        (err) => {
          let msg = 'تعذر تحديد موقعك';
          if (err.code === err.PERMISSION_DENIED) {
            setGeoState('denied');
            return;
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'الموقع غير متاح حالياً. تأكد من تفعيل خدمة تحديد الموقع (GPS) في هاتفك.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'انتهت مهلة تحديد الموقع. حاول مرة أخرى.';
          }
          setGeoState('error');
          setGeoError(msg);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
      );
    } catch {
      setGeoState('error');
      setGeoError('تعذر الوصول إلى خدمة تحديد الموقع. يمكنك تحديد موقعك يدوياً بالضغط على الخريطة.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !coords) return;

    setSubmitState('submitting');
    setErrorMsg('');

    const payload: NewServiceRequest = {
      service_key: service.key,
      service_name: service.name,
      customer_name: customerName.trim(),
      phone: null,
      location: null,
      latitude: coords.lat,
      longitude: coords.lng,
      notes: null,
    };

    const { error } = await supabase.from('service_requests').insert(payload);

    if (error) {
      setSubmitState('error');
      setErrorMsg('تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.');
      return;
    }

    setSubmitState('success');
  };

  const resetAndClose = () => {
    setCustomerName('');
    setCoords(null);
    setGeoState('idle');
    setGeoError('');
    setSubmitState('idle');
    setErrorMsg('');
    onClose();
  };

  const canSubmit = customerName.trim().length > 0 && coords !== null && submitState !== 'submitting';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-scale-in"
        onClick={submitState === 'submitting' ? undefined : resetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-slide-up overflow-hidden rounded-t-3xl bg-slate-900 shadow-2xl sm:rounded-3xl sm:m-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-l ${service.gradient} p-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {service.name}
                </h2>
                <p className="text-sm text-white/80">أدخل اسمك لطلب الخدمة</p>
              </div>
            </div>
            {submitState !== 'submitting' && (
              <button
                onClick={resetAndClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        {submitState === 'success' ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              تم إرسال طلبك بنجاح
            </h3>
            <p className="text-slate-400 mb-1">
              طلب خدمة <span className="font-semibold text-amber-400">{service.name}</span>
            </p>
            <p className="text-slate-400 mb-8">
              تم تحديد موقعك وإرسال الطلب. سيتم التواصل معك في أقرب وقت.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 py-3.5 font-bold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02]"
            >
              تم
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Name field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                الاسم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="اكتب اسمك"
                  required
                  disabled={submitState === 'submitting'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pr-11 pl-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-slate-800 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Location section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  موقعك الحالي
                </label>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={geoState === 'locating' || submitState === 'submitting'}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-transform hover:scale-[1.03] disabled:opacity-50"
                >
                  {geoState === 'locating' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      جاري التحديد...
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-3.5 w-3.5" />
                      تحديد موقعي
                    </>
                  )}
                </button>
              </div>

              {/* Map — always visible */}
              <div className="relative h-52 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                <div ref={mapRef} className="h-full w-full" />

                {/* Hint overlay when no location selected */}
                {!coords && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-slate-900/90 to-transparent pb-2 pt-8">
                    <p className="text-xs text-slate-300">
                      اضغط على الخريطة لتحديد موقعك أو استخدم زر «تحديد موقعي»
                    </p>
                  </div>
                )}

                {/* GPS error overlay */}
                {geoState === 'error' && (
                  <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-red-500/20 px-3 py-2 text-xs text-red-300 backdrop-blur-sm">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {geoError}
                  </div>
                )}

                {/* Permission denied — full instructions panel */}
                {geoState === 'denied' && (
                  <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-slate-900/95 px-5 py-4 text-center backdrop-blur-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                      <Settings className="h-6 w-6 text-amber-400" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      اسمح للتطبيق أن يحدد موقعك
                    </p>
                    <div className="w-full space-y-2 rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-right">
                      <p className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span>افتح إعدادات الهاتف ← الخصوصية ← الموقع</span>
                      </p>
                      <p className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span>ابحث عن هذا التطبيق وفعّل خيار «أثناء الاستخدام»</span>
                      </p>
                      <p className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span>أو من المتصفح: اضغط أيقونة القفل أعلى الصفحة واسمح بالموقع</span>
                      </p>
                      <p className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span>تأكد أيضاً من تفعيل خدمة تحديد الموقع (GPS) في الهاتف</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      يمكنك أيضاً تحديد موقعك يدوياً بالضغط على الخريطة
                    </p>
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.03]"
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                      إعادة المحاولة
                    </button>
                  </div>
                )}
              </div>

              {coords && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500" dir="ltr">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Error */}
            {submitState === 'error' && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l ${service.gradient} py-3.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {submitState === 'submitting' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الطلب'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
