import type { CSSProperties } from 'react';
import {
  Activity,
  Apple,
  Baby,
  Banknote,
  BarChart3,
  Beer,
  Bike,
  BookOpen,
  Briefcase,
  Bus,
  Camera,
  Car,
  Church,
  Clover,
  Coffee,
  CreditCard,
  DollarSign,
  Droplet,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  Laptop,
  Lightbulb,
  Music,
  PawPrint,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Plug,
  Palette,
  Receipt,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Stethoscope,
  Tag,
  Train,
  TrendingUp,
  Trophy,
  Utensils,
  Wallet,
  Watch,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Coffee,
  Pizza,
  Apple,
  Beer,
  Home,
  Sofa,
  Lightbulb,
  Plug,
  Droplet,
  Wrench,
  Car,
  Fuel,
  Bus,
  Train,
  Bike,
  Plane,
  Heart,
  Stethoscope,
  Pill,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Laptop,
  Smartphone,
  Gamepad2,
  Music,
  Film,
  Camera,
  Palette,
  Trophy,
  Gift,
  Shirt,
  Watch,
  Gem,
  Wallet,
  CreditCard,
  PiggyBank,
  Landmark,
  Banknote,
  TrendingUp,
  Receipt,
  Briefcase,
  BarChart3,
  Baby,
  PawPrint,
  Phone,
  Wifi,
  Tag,
  DollarSign,
  Zap,
  Activity,
  Church,
  Clover,
};

export const ENTITY_ICON_NAMES = Object.keys(ICON_MAP);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const NORMALIZED_MAP: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(ICON_MAP).map(([key, icon]) => [normalize(key), icon]),
);

interface EntityIconProps {
  name?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
  fallback?: string;
}

export function EntityIcon({ name, size = 18, className, style, fallback = 'Tag' }: EntityIconProps) {
  const Icon = name ? (ICON_MAP[name] ?? NORMALIZED_MAP[normalize(name)]) : undefined;
  if (Icon) return <Icon size={size} className={className} style={style} />;

  const isEmoji = !!name && /\p{Extended_Pictographic}/u.test(name);
  if (isEmoji) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>
        {name}
      </span>
    );
  }

  const Fallback = ICON_MAP[fallback] ?? Tag;
  return <Fallback size={size} className={className} style={style} />;
}

export const entityOptionIcon = (name?: string | null, color?: string | null) => (
  <EntityIcon name={name} size={16} style={{ color: color || undefined }} />
);
