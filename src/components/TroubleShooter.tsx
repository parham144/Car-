import React from "react";
import { CommonTrouble } from "../types";
import { AlertTriangle, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface TroubleShooterProps {
  troubles: CommonTrouble[];
}

export const TroubleShooter: React.FC<TroubleShooterProps> = ({ troubles }) => {
  if (!troubles || troubles.length === 0) return null;

  const getUrgencyStyles = (level: string) => {
    const lValue = level.toLowerCase();
    if (lValue.includes("قرمز") || lValue.includes("خطر")) {
      return {
        bg: "bg-rose-50 border-rose-200 text-rose-700 shadow-xs",
        label: "قرمز (خطرناک - توقف ماشین/تعویض فوری)",
        icon: ShieldAlert,
      };
    }
    if (lValue.includes("نارنجی") || lValue.includes("هشدار")) {
      return {
        bg: "bg-amber-50 border-amber-200 text-amber-700 shadow-xs",
        label: "نارنجی (نیاز به مراجعه زودهنگام)",
        icon: AlertTriangle,
      };
    }
    return {
      bg: "bg-blue-50 border-blue-200 text-blue-700 shadow-xs",
      label: "زرد (بررسی در سرویس دوره‌ای معمولی)",
      icon: HelpCircle,
    };
  };

  return (
    <div id="diagnostics-box" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
        <div>
          <h3 className="text-base font-bold text-slate-800">راهنما و عیب‌یابی عیوب رایج خودرو</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            نشانه‌های تجربی رایج که نشان‌دهنده زمان تعویض یا بازبینی قطعات مصرفی این خودرو است
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {troubles.map((trouble, idx) => {
          const urgency = getUrgencyStyles(trouble.urgentLevel);
          const IconComponent = urgency.icon;

          return (
            <div
              key={idx}
              id={`trouble-card-${idx}`}
              className="p-5 bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all duration-300 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <h4 className="font-bold text-sm text-slate-800 flex-1 leading-relaxed">
                  {trouble.symptom}
                </h4>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-bold flex items-center gap-1 ${urgency.bg}`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {urgency.label.split(" ")[0]}
                </span>
              </div>

              <div className="mt-3 text-xs leading-relaxed text-slate-600 bg-white p-3.5 rounded-xl border border-slate-150">
                <span className="font-bold text-slate-800 block mb-1">علت فنی یا قطعه متهم:</span>
                {trouble.possibleCause}
              </div>

              <div className="mt-3 text-[11px] text-slate-400">
                سطح هشدار: <span className="font-semibold text-slate-600">{urgency.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
