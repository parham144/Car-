import React from "react";
import { Car } from "lucide-react";

interface PopularCarsProps {
  onSelectCar: (carName: string) => void;
}

interface PopularCarItem {
  name: string;
  type: "ایرانی" | "مونتاژ" | "خارجی";
  year: string;
  desc: string;
}

const POPULAR_CARS: PopularCarItem[] = [
  { name: "پژو ۲۰۶ تیپ ۵", type: "ایرانی", year: "۱۳۹۰-۱۴۰۰", desc: "موتور TU5، پرتیراژ و محبوب" },
  { name: "پراید ۱۳۱", type: "ایرانی", year: "۱۳۸۹-۱۳۹۹", desc: "موتور HP+، کم‌خرج‌ترین خودروی بازار" },
  { name: "دنا پلاس توربو شاهین", type: "ایرانی", year: "۱۴۰۰-۱۴۰۵", desc: "موتور EF7 توربو، آپشنال ملی" },
  { name: "تندر ۹۰ (L90)", type: "مونتاژ", year: "۱۳۸۶-۱۳۹۸", desc: "موتور K4M، بسیار باکیفیت و با دوام" },
  { name: "شاهین دنده‌ای سایپا", type: "ایرانی", year: "۱۴۰۰-۱۴۰۵", desc: "موتور m15tc توربوشارژ، بدنه مستحکم" },
  { name: "جک S5 توربو", type: "مونتاژ", year: "۱۳۹۵-۱۴۰۲", desc: "شاسی‌بلند چینی پرطرفدار در ایران" },
  { name: "هیوندای سانتافه DM", type: "خارجی", year: "۲۰۱۴-۲۰۱۸", desc: "موتور ۲۴۰۰، شاسی‌بلند لوکس وارداتی" },
  { name: "النترا ۲۰۱۷", type: "خارجی", year: "۲۰۱۶-۲۰۱۸", desc: "سدان خانوادگی، با دوام و پرطرفدار" },
];

export const PopularCars: React.FC<PopularCarsProps> = ({ onSelectCar }) => {
  return (
    <div id="popular-cars-container" className="mt-4 transition-opacity duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">پیشنهادهای بازار لوازم یدکی (کلیک سریع)</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {POPULAR_CARS.map((car, idx) => (
          <button
            key={idx}
            id={`popular-car-btn-${idx}`}
            onClick={() => onSelectCar(car.name)}
            className="group flex flex-col justify-between p-5 bg-white border border-slate-200 hover:border-blue-600 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 text-right hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                    car.type === "خارجی"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : car.type === "مونتاژ"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {car.type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{car.year}</span>
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">
                {car.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed h-8">
                {car.desc}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
              <span>دریافت لیست مصرفی‌ها و قیمت روز</span>
              <span className="font-bold">←</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
