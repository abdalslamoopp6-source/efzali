import {
  Battery, Wrench, Fuel, Key, Truck, Car, Anchor,
  Package, Sofa, Forklift, WashingMachine,
  type LucideIcon,
} from 'lucide-react';

export interface Service {
  key: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
}

export const services: Service[] = [
  { key: 'battery', name: 'اشتراك بطارية', icon: Battery, gradient: 'from-amber-500 to-orange-600' },
  { key: 'tire', name: 'إصلاح البنشر', icon: Wrench, gradient: 'from-rose-500 to-red-600' },
  { key: 'fuel', name: 'توصيل الوقود', icon: Fuel, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'keys', name: 'فتح وبرمجة المفاتيح', icon: Key, gradient: 'from-sky-500 to-blue-600' },
  { key: 'mobile_workshop', name: 'ورشة متنقلة', icon: Forklift, gradient: 'from-slate-600 to-gray-800' },
  { key: 'recovery', name: 'سطحة ونقل سيارات', icon: Truck, gradient: 'from-indigo-500 to-blue-700' },
  { key: 'crane', name: 'كرين نقل ورفع', icon: Anchor, gradient: 'from-yellow-500 to-amber-600' },
  { key: 'goods', name: 'نقل البضائع', icon: Package, gradient: 'from-cyan-500 to-sky-600' },
  { key: 'furniture', name: 'نقل الأثاث والعفش', icon: Sofa, gradient: 'from-violet-500 to-purple-600' },
  { key: 'equipment', name: 'نقل المعدات', icon: Car, gradient: 'from-teal-500 to-cyan-600' },
  { key: 'mobile_wash', name: 'مغسلة متنقلة', icon: WashingMachine, gradient: 'from-blue-500 to-indigo-600' },
];
