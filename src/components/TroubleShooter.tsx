import React from "react";
import { CommonTrouble } from "../types";
import { AlertTriangle, ShieldAlert, Sparkles, HelpCircle, MessageSquare, Wrench } from "lucide-react";

interface TroubleShooterProps {
  troubles: CommonTrouble[];
  carModelName?: string;
  onAskOusEmad?: (query: string) => void;
}

export const TroubleShooter: React.FC<TroubleShooterProps> = ({ troubles, carModelName, onAskOusEmad }) => {
  if (!troubles || troubles.length === 0) return null;

  const getUrgencyStyles = (level: string) => {
    const lValue = level.toLowerCase();
    if (lValue.includes("قرمز") || lValue.includes("خطر")) {
      return {
        bg: "bg-rose-50 border-rose-200 text-rose-700 shadow-xs",
        label: "قرمز (خطرناک)",
        tip: "حرکت دادن خودرو با این شرایط خطرناک بوده و فوراً خودرو را خاموش یا با احتیاط كامل به نزدیک‌ترین تعمیرگاه برسانید تا موتور آسیب نبیند.",
        icon: ShieldAlert,
      };
    }
    if (lValue.includes("نارنجی") || lValue.includes("هشدار")) {
      return {
        bg: "bg-amber-50 border-amber-200 text-amber-700 shadow-xs",
        label: "نارنجی (هشدار)",
        tip: "این مشکل نشان‌دهنده استهلاک تدریجی است؛ حداکثر ظرف چند روز آینده برای پیشگیری از خرابی‌های گران‌قیمت ثانویه اقدام کنید.",
        icon: AlertTriangle,
      };
    }
    return {
      bg: "bg-blue-50 border-blue-200 text-blue-700 shadow-xs",
      label: "زرد (معمولی)",
      tip: "موضوع فوریت اضطراری ندارد؛ در اولین فرصت مراجعه بعدی برای سرویس دوره‌ای معمولی، از استادکار بخواهید این مورد را چک کند.",
      icon: HelpCircle,
    };
  };

  return (
    <div id="diagnostics-box" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-right">
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
              className="bg-white border border-slate-200 hover:border-blue-600 p-5 rounded-2xl shadow-xs transition-all duration-300 flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-relaxed">
                      {trouble.symptom}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-sans">
                      <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-150 flex items-center gap-1">
                        وضعیت عیب: <strong className="text-slate-700 font-bold">پیش‌بینی تجربی</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:text-left shrink-0">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-bold flex items-center gap-1 ${urgency.bg}`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {urgency.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="text-slate-600">
                    <strong className="text-slate-800 font-bold">علت فنی یا قطعه متهم:</strong> {trouble.possibleCause}
                  </div>
                </div>
              </div>

              {/* Advisor highlight tip box */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/60 mt-4 flex flex-col justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0 select-none">💡</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic">
                    <strong>توصیه اوس عماد:</strong> {urgency.tip}
                  </p>
                </div>
                
                {onAskOusEmad && (
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    <button
                      onClick={() => {
                        const q = `سلام اوس عماد جان. درباره نشانه «${trouble.symptom}» برای ماشین «${carModelName || "من"}» سوال داشتم. علت فنی بروز این ایراد چیه و اجرت حدودی رفع عیبش چقدر میشه؟`;
                        onAskOusEmad(q);
                      }}
                      className="text-[10px] py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 focus:outline-none font-bold shadow-xs hover:shadow"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>استعلام اجرت رفع عیب</span>
                    </button>
                    <button
                      onClick={() => {
                        const q = `سلام اوس عماد. برای حل مشکل «${trouble.symptom}» در خودروی «${carModelName || "من"}» (با علت فرضی احتمالی: «${trouble.possibleCause}»، چه قطعات مصرفی رو باید بخرم؟`;
                        onAskOusEmad(q);
                      }}
                      className="text-[10px] py-2 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 focus:outline-none font-bold shadow-xs hover:shadow"
                    >
                      <Wrench className="w-3 h-3 text-slate-500" />
                      <span>مشاوره خرید قطعات</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
