import {
  LayoutDashboard,
  Rocket,
  BookText,
  SpellCheck2,
  PenLine,
  Headphones,
  Mic,
  Layers,
  ListChecks,
  AlertTriangle,
  ClipboardList,
  FileSpreadsheet,
  TrendingUp,
  MessageCircle,
  Settings,
  CalendarDays,
  Trophy,
  GraduationCap,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "Study", icon: Rocket },
  { href: "/mi-clase", label: "Mi Clase", icon: GraduationCap },
  { href: "/reading", label: "Reading", icon: BookText },
  { href: "/use-of-english", label: "Use of English", icon: SpellCheck2 },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/listening", label: "Listening", icon: Headphones },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/vocabulary", label: "Vocabulary", icon: Layers },
  { href: "/grammar", label: "Grammar", icon: ListChecks },
  { href: "/my-errors", label: "My Errors", icon: AlertTriangle },
  { href: "/study-plan", label: "Study Plan", icon: CalendarDays },
  { href: "/mock-exam", label: "Mock Exam", icon: ClipboardList },
  { href: "/exam-format", label: "Formato del examen", icon: FileSpreadsheet },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/ai-tutor", label: "AI Tutor", icon: MessageCircle },
  { href: "/pricing", label: "Planes y precios", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];
