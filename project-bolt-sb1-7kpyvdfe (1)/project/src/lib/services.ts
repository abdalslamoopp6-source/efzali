import {
  Battery,
  Wrench,
  Fuel,
  Key,
  Truck,
  Car,
  Anchor,
  Package,
  Sofa,
  Forklift,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react';

export interface Service {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

export const services: Service[] = [
  {
    key: 'battery',
    name: 'اشتراك بطارية',
    description: 'تبديل وتعزيز بطارية السيارة',
    icon: Battery,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    key: 'tire',
    name: 'إصلاح البنشر',
    description: 'إصلاح وتبديل الإطارات',
    icon: Wrench,
    gradient: 'from-rose-500 to-red-600',
  },
  {
    key: 'fuel',
    name: 'توصيل الوقود',
    description: 'توصيل البنزين أو الديزل لموقعك',
    icon: Fuel,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'keys',
    name: 'فتح وبرمجة المفاتيح',
    description: 'فتح السيارة وبرمجة مفاتيح جديدة',
    icon: Key,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    key: 'mobile_workshop',
    name: 'ورشة متنقلة',
    description: 'فنيون يصلون إليك لإصلاح أعطال السيارة',
    icon: Forklift,
    gradient: 'from-slate-600 to-gray-800',
  },
  {
    key: 'recovery',
    name: 'سطحة ونقل سيارات',
    description: 'نقل السيارات المعطلة أو المصابة',
    icon: Truck,
    gradient: 'from-indigo-500 to-blue-700',
  },
  {
    key: 'crane',
    name: 'كرين نقل ورفع',
    description: 'رفع ونقل المعدات الثقيلة',
    icon: Anchor,
    gradient: 'from-yellow-500 to-amber-600',
  },
  {
    key: 'goods',
    name: 'نقل البضائع',
    description: 'نقل البضائع والشحنات',
    icon: Package,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    key: 'furniture',
    name: 'نقل الأثاث والعفش',
    description: 'نقل الأثاث بأمان وعناية',
    icon: Sofa,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    key: 'equipment',
    name: 'نقل المعدات',
    description: 'نقل المعدات الثقيلة والمركبات',
    icon: Car,
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    key: 'mobile_wash',
    name: 'مغسلة متنقلة',
    description: 'غسيل وتنظيف السيارة في موقعك',
    icon: WashingMachine,
    gradient: 'from-blue-500 to-indigo-600',
  },
];
