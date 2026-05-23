import { cn } from "@/lib/utils";

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-full min-w-0 space-y-6", className)}>{children}</div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 min-w-0">
      <div className="min-w-0">
        <h2 className="font-display text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-[#111827] truncate">{title}</h2>
        {description && <p className="text-[14px] text-[#6B7280]">{description}</p>}
      </div>
      {actions && <div className="shrink-0 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type Tone = "green" | "blue" | "orange" | "violet";
const toneMap: Record<Tone, { iconBg: string; iconColor: string; ring: string }> = {
  green:  { iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]", ring: "ring-[#BBF7D0]" },
  blue:   { iconBg: "bg-[#DBEAFE]", iconColor: "text-[#2563EB]", ring: "ring-[#BFDBFE]" },
  orange: { iconBg: "bg-[#FED7AA]", iconColor: "text-[#F97316]", ring: "ring-[#FDBA74]" },
  violet: { iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" },
};

export function StatCard({ label, value, icon: Icon, tone = "green", hint }: { label: string; value: React.ReactNode; icon?: any; tone?: Tone; hint?: string }) {
  const t = toneMap[tone];
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-[#BBF7D0] bg-gradient-to-br from-white to-[#F0FDF4] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-[#6B7280] uppercase tracking-wide font-semibold truncate">{label}</div>
          <div className="mt-2 font-display text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-[#111827] break-words">{value}</div>
          {hint && <div className="mt-1 text-[12px] text-[#6B7280] truncate">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 sm:h-11 sm:w-11 rounded-xl grid place-items-center shrink-0 ring-1", t.iconBg, t.ring)}>
            <Icon className={cn("h-5 w-5", t.iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTableWrapper({ children, minWidth = 720 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

export function ResponsiveActionBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between min-w-0">{children}</div>;
}
