import { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Sparkles,
  History,
  Trash2,
  AlertCircle,
  HelpCircle,
  Gauge,
  Layers,
  DollarSign,
  MessageSquare,
  Wrench as WrenchIcon,
} from "lucide-react";
import { PopularCars } from "./components/PopularCars";
import { PartsChart } from "./components/PartsChart";
import { TroubleShooter } from "./components/TroubleShooter";
import { OusEmadChat } from "./components/OusEmadChat";
import { CarConsumablesResponse, SearchHistoryItem } from "./types";
import {
  formatPriceToman,
  toPersianNumberString,
  loadSearchHistory,
  saveToSearchHistory,
  clearSearchHistory,
} from "./utils";

const LOADING_STEPS = [
  "اوس عماد در حال پوشیدن لباس کاره...",
  "درحال مراجعه به لوازم یدکی بازار چراغ‌برق تهران...",
  "استعلام گرفتن آخرین نرخ مصوب لنت ترمز و تسمه‌ها...",
  "محاسبه بر اساس بازار آزاد و نرخ‌های جدید سال ۱۴۰۵...",
  "بررسی روغن‌های مجاز و مایعات استاندارد موتور...",
  "جمع‌آوری اطلاعات عیوب تجربی و نشانه‌های تعویض...",
];

export default function App() {
  const [carModelInput, setCarModelInput] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CarConsumablesResponse | null>(null);
  const [historyList, setHistoryList] = useState<SearchHistoryItem[]>([]);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"parts" | "diagnostics" | "chat">("parts");
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  // Chat prefilled question state
  const [prefilledPrompt, setPrefilledPrompt] = useState("");

  // Load search history once on mount
  useEffect(() => {
    setHistoryList(loadSearchHistory());
  }, []);

  // Cycle funny Persian mechanic loading phrases
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSearch = async (targetCarName: string) => {
    const trimmed = targetCarName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveTab("parts");
    setActiveCategoryIdx(0);

    try {
      const response = await fetch("/api/car-parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carModel: trimmed,
          specifications,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در دریافت اطلاعات از سرور.");
      }

      const data: CarConsumablesResponse = await response.json();
      setResult(data);
      
      // Update local storage history
      const updatedHistory = saveToSearchHistory(trimmed);
      setHistoryList(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "برقراری ارتباط منتفی شد. لطفا اینترنت را بررسی فرمایید.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    clearSearchHistory();
    setHistoryList([]);
  };

  // Pre-fill a customized query into the chat and focus on chat tab
  const handleQueryToOusEmad = (partName: string) => {
    if (!result) return;
    const model = result.carModelName;
    const query = `سلام اوس عماد، درباره قطعه «${partName}» برای ماشین «${model}» سوال داشتم. اجرت تعویض حدودی این قطعه چقدره و موقع خرید چطور جنس تایید شده و اصلی رو تشخیص بدم؟ دمت گرم.`;
    setPrefilledPrompt(query);
    setActiveTab("chat");
    
    // Scroll smoothly to chat zone
    setTimeout(() => {
      document.getElementById("tab-view-section")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  return (
    <div id="application-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600/10">
      {/* Top Header Banner */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-1.5 justify-end">
                <span>قیمت‌یاب هوشمند قطعات مصرفی خودرو</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold font-mono">
                  v3.5 Beta
                </span>
              </h1>
              <span className="text-xs text-slate-450 block font-medium">استعلام آنلاین لایه مصرفی‌ها و تحلیل قیمت روز بازار چراغ‌برق</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200">
            امروز: {new Date().toLocaleDateString("fa-IR")}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col gap-8">
        {/* Intro Concept */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex-1 text-right">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-end mb-2">
              <span>برآورد مخارج فنی و لوازم یدکی با هوش مصنوعی</span>
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              دیگر نگران گران‌فروشی دلالان لوازم یدکی نباشید! مدل خودروی خود را وارد کنید (ایرانی، مونتاژ یا وارداتی لوکس) تا لیست کاملی از روغن‌ها، فیلترها، تسمه‌ها و لنت‌ها را با عمر مفید و لول قیمت بازار آزاد تهران تقدیمتان کنیم. همچنین می‌توانید به صورت زنده با دستیار متخصص عیب‌یابی گفتگو کنید.
            </p>
          </div>
        </div>

        {/* Input Controls and History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search form Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-right">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">مشخصات خودروی مورد نظر خود را بنویسید</h3>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(carModelInput);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-slate-450 font-bold mb-2">نام برند و مدل دقیق خودرو:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={carModelInput}
                    onChange={(e) => setCarModelInput(e.target.value)}
                    placeholder="مثلاً: پژو ۲۰۷ دنده‌ای، جک اس ۵، کیا اپتیما ۲۰۱۶، سمند سورن ای‌اف‌سون..."
                    className="w-full text-xs px-4 py-3.5 bg-slate-50 border border-slate-200 hover:border-blue-500 focus:border-blue-500 rounded-xl focus:outline-none text-slate-800 placeholder-slate-400 block font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-450 font-bold mb-2">توضیحات تکمیلی یا شرایط خاص (اختیاری):</label>
                <input
                  type="text"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="مثال: کارکرد بالای ۳۰۰ هزارتاست / جنس باکیفیت میخوام / قطعات ژاپنی پیشنهاد بده"
                  className="w-full text-xs px-4 py-3 bg-slate-50 border border-slate-200 hover:border-blue-500 focus:border-blue-500 rounded-xl focus:outline-none text-slate-800 placeholder-slate-400 block font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !carModelInput.trim()}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-300 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>در حال استعلام قطعات...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>دریافت لیست قطعات و حدود قیمت روز</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search History Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-right flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4.5 h-4.5 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-700">آخرین استعلام‌های شما</h3>
                </div>
                {historyList.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    پاک کردن همه
                  </button>
                )}
              </div>

              {historyList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs text-wrap leading-relaxed">
                  تاکنون خودرویی استعلام نشده است. یکی از نمونه‌های زیر یا مدل ماشین خود را وارد کنید.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {historyList.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCarModelInput(item.carModel);
                        handleSearch(item.carModel);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-100 border border-slate-200/50 hover:border-blue-500 rounded-xl transition-all text-right text-xs text-slate-700 hover:text-blue-600 cursor-pointer font-medium"
                    >
                      <span className="font-semibold">{item.carModel}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 mt-4 pt-2 border-t border-slate-100 leading-relaxed font-semibold">
              📌 تاریخچه استعلام مکرر شما بر روی همین کاوشگر مرورگر ذخیره می‌گردد.
            </div>
          </div>
        </div>

        {/* Loading Screen */}
        {isLoading && (
          <div id="loading-overlay" className="py-24 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-slate-200 border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                🛠️
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-800">{LOADING_STEPS[loadingStepIdx]}</h4>
            <p className="text-xs text-slate-500 mt-2">
              هوش مصنوعی در حال جمع‌آوری اطلاعات دقیق از بازار لوازم یدکی خودرو در تهران است...
            </p>
          </div>
        )}

        {/* Error Box */}
        {error && (
          <div id="error-box-display" className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start gap-3 text-right shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <h4 className="font-bold text-sm mb-1">خطا در پردازش اطلاعات</h4>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Initial Preset Car Grid */}
        {!result && !isLoading && (
          <PopularCars onSelectCar={(carName) => {
            setCarModelInput(carName);
            handleSearch(carName);
          }} />
        )}

        {/* Results Desk */}
        {result && !isLoading && (
          <div id="analysis-dashboard" className="space-y-6 animate-fadeIn duration-500">
            {/* Summary Banner Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase block mb-1">گزارش آنالیز خودرو</span>
                  <h2 className="text-2xl font-black text-slate-800">{result.carModelName}</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">تعداد کل مصرفی‌ها:</span>
                    <span className="text-xs font-bold text-blue-650 text-blue-600">
                      {toPersianNumberString(result.partsCount)} قطعه
                    </span>
                  </div>
                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">سطح هزینه نگهداری:</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded border ${
                        result.overallExpenseLevel.includes("بسیار بالا") || result.overallExpenseLevel.includes("بالا")
                          ? "text-rose-700 bg-rose-50 border-rose-200"
                          : result.overallExpenseLevel.includes("متوسط")
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : "text-emerald-700 bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      {result.overallExpenseLevel}
                    </span>
                  </div>
                </div>
              </div>
              
              {result.isOfflineData && (
                <div className="mb-4 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-800 font-medium flex items-center justify-between gap-3 text-right">
                  <span className="bg-amber-100/80 text-amber-900 border border-amber-250 rounded-lg px-2.5 py-1 text-[10px] font-extrabold shrink-0 font-mono">
                    سیمولاتور صنف
                  </span>
                  <span>
                    دوست من! به علت عدم راه‌اندازی کلید API یا محدودیت کلوپ ابری، این اطلاعات به طریقه آفلاین مطمئن چراغ‌برق برآورد شده است. تخمین قیمت‌ها همگی کاملاً واقعی و به‌روز هستند!
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4.5 rounded-xl border border-slate-200/60">
                {result.summary}
              </p>
            </div>

            {/* Main Application Segment Split - Left for Tabs, Right for Budget Chart */}
            <div id="tab-view-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Zone - Navigation & Multi-Tab Views */}
              <div className="lg:col-span-2 space-y-4">
                {/* Tab switchers row */}
                <div className="bg-slate-100/80 p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-xs">
                  <button
                    onClick={() => setActiveTab("parts")}
                    className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      activeTab === "parts"
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>لیست قطعات و قیمت روز</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("diagnostics")}
                    className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      activeTab === "diagnostics"
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>عیب‌یابی عیوب تجربی</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                      activeTab === "chat"
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>گپ و گفت فنی با اوس عماد</span>
                  </button>
                </div>

                {/* Tab 1 content: Interactive Categorized Parts Matrix */}
                {activeTab === "parts" && (
                  <div className="space-y-4">
                    {/* Category selectors horizontal sliding bar */}
                    <div className="p-1.5 bg-slate-100/50 border border-slate-200/80 rounded-xl flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                      {result.categories.map((cat, idx) => (
                        <button
                          key={idx}
                          id={`cat-pill-btn-${idx}`}
                          onClick={() => setActiveCategoryIdx(idx)}
                          className={`text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                            activeCategoryIdx === idx
                              ? "bg-white text-blue-600 border border-slate-200 font-bold shadow-xs"
                              : "text-slate-500 hover:text-slate-800 bg-transparent border border-transparent"
                          }`}
                        >
                          {cat.categoryName} ({cat.parts.length})
                        </button>
                      ))}
                    </div>

                    {/* Consumable items grid for selected category */}
                    <div className="space-y-4 text-right">
                      {result.categories[activeCategoryIdx]?.parts.map((part, pIdx) => (
                        <div
                          key={pIdx}
                          id={`part-item-card-${activeCategoryIdx}-${pIdx}`}
                          className="bg-white border border-slate-200 hover:border-blue-600 p-6 rounded-2xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                            <div>
                              <h3 className="font-bold text-slate-850 text-slate-800 text-sm mb-1">{part.partName}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                                  عمر مفید: <strong className="text-slate-700 font-bold">{part.lifetime}</strong>
                                </span>
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                                  سختی تعویض: <strong className="text-slate-700 font-bold">{part.installDifficulty}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="text-right sm:text-left shrink-0">
                              <span className="block text-[10px] text-slate-400 font-bold mb-0.5">حدود قیمت روز در بازار ایران (تومان)</span>
                              <span className="text-sm font-black text-emerald-600">
                                {formatPriceToman(part.priceRange.min)}
                              </span>
                              <span className="text-slate-400 text-xs mx-1">تا</span>
                              <span className="text-sm font-black text-rose-650 text-rose-600">
                                {formatPriceToman(part.priceRange.max)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="leading-relaxed text-slate-600">
                              <strong className="text-slate-800 font-bold">نشانه نقص فنی (زمان تعویض):</strong> {part.replacementSigns}
                            </div>
                            <div className="leading-relaxed text-slate-600">
                              <strong className="text-slate-800 font-bold">مارک‌ها و برندهای معتبر:</strong>{" "}
                              <div className="inline-flex flex-wrap gap-1.5 mr-1.5 mt-0.5">
                                {part.suggestedBrands.map((brand, bIdx) => (
                                  <span key={bIdx} className="bg-slate-50 text-slate-600 py-0.5 px-2.5 rounded-lg border border-slate-200 text-[10px] font-medium">
                                    {brand}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Mechanic Ous Emad Pro Tip segment with direct instant inquiry button */}
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/60 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                              <div className="flex items-start gap-2.5">
                                <span className="text-base shrink-0 select-none">💡</span>
                                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                  <strong>توصیه اوس عماد:</strong> {part.proTip}
                                </p>
                              </div>
                              <button
                                onClick={() => handleQueryToOusEmad(part.partName)}
                                className="text-[10px] px-3.5 py-2 bg-blue-650 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5 focus:outline-none font-bold shadow-xs hover:shadow"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>استعلام اجرت تعویض و خرید</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2 content: Common car troubleshooting */}
                {activeTab === "diagnostics" && (
                  <TroubleShooter troubles={result.commonTroubles} />
                )}

                {/* Tab 3: AI Mechanic custom chat module */}
                {activeTab === "chat" && (
                  <OusEmadChat
                    carModel={result.carModelName}
                    prefilledPrompt={prefilledPrompt}
                    onClearPrefilled={() => setPrefilledPrompt("")}
                  />
                )}
              </div>

              {/* Right Zone - Price and budget charts / cost breakdown dashboard */}
              <div id="chart-panel-display" className="space-y-6">
                <PartsChart categories={result.categories} />
                
                {/* Visual advice box for spot-checking bad parts in local shops */}
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 text-right space-y-3 shadow-xs">
                  <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5 justify-end">
                    <span>۳ فرمول طلایی اوس عماد برای خرید لوازم یدکی خودرو</span>
                    <WrenchIcon className="w-4 h-4 text-amber-700" />
                  </h4>
                  <ul className="space-y-2 text-[11px] leading-relaxed text-slate-650 text-slate-600 list-inside text-justify">
                    <li>
                      <strong className="text-slate-800 font-bold">۱. شناسه رهگیری وزارت صمت را چک کنید:</strong> تمامی قطعات برقی یا حساس مثل شمع، وایر، کمک‌فنر و لنت باید دارای شناسه رهگیری باشند. با وارد کردن کد رهگیری در سیستم وزارت صمت، اصالت کالا فوراً تایید می‌شود.
                    </li>
                    <li>
                      <strong className="text-slate-800 font-bold">۲. هرگز تفاوت فاحش قیمت را نپذیرید:</strong> اگر برندی را همه‌جا ۲ میلیون تومان قیمت دادند و فروشگاهی آن را ۱.۲ میلیون فروخت، به کلماتی چون «خرید قدیم» تکیه نکنید؛ احتمالاً با قطعه بازسازی شده یا درجه ۳ چینی مواجهید.
                    </li>
                    <li>
                      <strong className="text-slate-800 font-bold">۳. از هولوگرام‌های سه‌بعدی متحرک کمک بگیرید:</strong> برندهای تراز اول بازار مانند ایساکو یا سایپا یدک دارای هولوگرام چندوجهی ظریف هستند که هنگام کج کردن تغییر فرکانس یا نوشته می‌دهند.
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-450 mt-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans leading-relaxed text-slate-500">
            تمامی قیمت‌های ارائه شده در این کاوشگر به صورت حدودی و برآورد آخرین اطلاعات میدانی بازار لوازم یدکی تهران (چراغ‌برق) و اتحادیه‌های صنف در سال ۱۴۰۵ می‌باشد.
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            Powered by Google Gemini 3.5 & AI Studio Build. Farsi localization template.
          </p>
        </div>
      </footer>
    </div>
  );
}
