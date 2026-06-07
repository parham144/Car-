import React, { useState } from "react";
import { FavoritePart } from "../types";
import { Heart, Trash2, Copy, Sparkles, MessageSquare, ListTodo, Check } from "lucide-react";
import { formatPriceToman, toPersianNumberString } from "../utils";

interface FavoritesListProps {
  favorites: FavoritePart[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
  onAskOusEmad: (partName: string, carModel: string) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onRemoveFavorite,
  onClearAll,
  onAskOusEmad,
}) => {
  const [copied, setCopied] = useState(false);

  if (!favorites || favorites.length === 0) {
    return (
      <div id="favorites-empty-box" className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs text-right shadow-xs space-y-3">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <Heart className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 text-sm">لیست علاقه‌مندی‌ها و خرید شما خالی است</h4>
        <p className="leading-relaxed max-w-sm mx-auto">
          در زمان مشاهده آنالیز قطعات مصرفی هر خودرو، با کلیک روی آیکون قلب (نشان کردن)، قطعه مورد نیازتان را برای مراجعات بعدی به بازار تهران یا خرید آنلاین در اینجا ذخیره کنید.
        </p>
      </div>
    );
  }

  const handleCopyList = () => {
    let text = "📋 لیست قطعات نشان‌شده جهت خرید از بازار (برآورد اوس عماد - سال ۱۴۰۵):\n\n";
    favorites.forEach((item, idx) => {
      text += `${idx + 1}. قطعه: ${item.partName} (${item.carModel})\n`;
      text += `   🔸 قیمت تقریبی: ${formatPriceToman(item.priceRange.min)} تا ${formatPriceToman(item.priceRange.max)}\n`;
      if (item.suggestedBrands && item.suggestedBrands.length > 0) {
        text += `   🔸 برندهای پیشنهادی: ${item.suggestedBrands.join(" - ")}\n`;
      }
      text += "\n";
    });
    text += "🚘 با تشکر از قیمت‌یاب هوشمند خودرو اوس عماد";

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="favorites-panel-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-right space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 border border-rose-100">
            <Heart className="w-4.5 h-4.5 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">لیست خرید و علاقه‌مندی‌ها</h3>
            <span className="text-[10px] text-slate-400 block font-medium">
              مجموعاً {toPersianNumberString(favorites.length)} قطعه نشان‌شده برای مراجعه به بازار
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyList}
            className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 cursor-pointer font-bold ${
              copied
                ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                : "bg-slate-50 border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-slate-600"
            }`}
            title="کپی لیست قطعات جهت اشتراک گذاری"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "کپی شد!" : "اشتراک و کپی لیست"}</span>
          </button>

          <button
            onClick={onClearAll}
            className="text-[10px] px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 hover:border-rose-300 text-rose-700 rounded-lg cursor-pointer transition-colors font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاکسازی</span>
          </button>
        </div>
      </div>

      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
        {favorites.map((item) => (
          <div
            key={item.id}
            id={`fav-item-${item.id}`}
            className="p-4 bg-slate-50/75 border border-slate-200 hover:border-rose-450 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-200 font-bold">
                  {item.carModel}
                </span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  {item.partName}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans mt-1">
                <span>قیمت بازار تهران:</span>
                <strong className="text-slate-700 font-bold">
                  {formatPriceToman(item.priceRange.min)} تا {formatPriceToman(item.priceRange.max)}
                </strong>
              </div>

              {item.suggestedBrands && item.suggestedBrands.length > 0 && (
                <div className="text-[10px] text-slate-400 leading-none">
                  برندهای پیشنهادی: <span className="font-semibold text-slate-600">{item.suggestedBrands.join("، ")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
              <button
                onClick={() => onAskOusEmad(item.partName, item.carModel)}
                className="p-2 border border-slate-200 hover:border-slate-350 bg-white text-slate-705 text-slate-600 hover:text-blue-600 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold"
                title="استعلام مجدد اجرت کارگاه از اوس عماد"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شرح اجرت از اوس عماد</span>
              </button>

              <button
                onClick={() => onRemoveFavorite(item.id)}
                className="p-2 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                title="حذف از لیست قطعات"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/60 flex items-start gap-2.5">
        <span className="text-base shrink-0 select-none">📌</span>
        <p className="text-[10px] text-slate-655 text-slate-600 leading-relaxed font-semibold">
          <strong>یادداشت خرید:</strong> لیست فوق به صورت آفلاین در مرورگر شما باقی می‌ماند تا وقتی در فروشگاه لوازم یدکی چراغ‌برق یا فروشگاه‌های اینترنتی قیمت می‌گیرید، ارقام تخمینی را مقایسه و فریب اجناس تقلبی را نخورید.
        </p>
      </div>
    </div>
  );
};
