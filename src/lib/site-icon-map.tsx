import type { ReactNode } from "react";
import {
  CreditCard,
  Download,
  Gamepad2,
  Headphones,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { PerkIconKey, StatIconKey } from "@/types/site-settings";

export const statIconMap: Record<StatIconKey, ReactNode> = {
  games: <Gamepad2 className="h-7 w-7" />,
  users: <Users className="h-7 w-7" />,
  downloads: <Download className="h-7 w-7" />,
  uptime: <Trophy className="h-7 w-7" />,
};

export const perkIconMap: Record<PerkIconKey, ReactNode> = {
  shield: <Shield className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  "credit-card": <CreditCard className="h-6 w-6" />,
  headphones: <Headphones className="h-6 w-6" />,
};
