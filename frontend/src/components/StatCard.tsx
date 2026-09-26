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
  color = "blue",
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {renderIcon()}
        </div>
      </div>

      {descText && (
        <p className="mt-4 text-xs text-slate-500">{descText}</p>
      )}
    </div>
  );
};

export default StatCard;
