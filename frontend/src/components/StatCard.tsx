import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: ReactNode | LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky" | "blue";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon,
  color = "indigo",
}) => {
  const isLucideIconComponent = typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon);

  const renderIcon = () => {
    if (isLucideIconComponent) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="w-5 h-5" />;
    }
    return icon as ReactNode;
  };

  const descText = description || subtitle;

  const colorStyles = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 glow-indigo",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 glow-amber",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80 bg-slate-900/70 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110`}>
          {renderIcon()}
        </div>
      </div>

      {descText && (
        <p className="mt-4 text-xs font-medium text-slate-400 border-t border-slate-800/60 pt-3">
          {descText}
        </p>
      )}
    </div>
  );
};

export default StatCard;
