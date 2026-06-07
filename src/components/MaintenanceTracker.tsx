import React, { useState, useEffect } from "react";
import {
  Wrench,
  Calendar,
  Gauge,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Info,
  Car,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { MaintenanceRecord } from "../types";
import { toPersianNumberString, formatPriceToman } from "../utils";

interface MaintenanceTrackerProps {
  currentCarModel: string;
}

interface PartPreset {
  name: string;
  defaultLifespanKm: number;
  defaultLifespanMonths: number;
}

const COMMON_PRESETS: PartPreset[] = [
  { name: "روغن موتور و فیلتر روغن", defaultLifespanKm: 7000, defaultLifespanMonths: 6 },
  { name: "فیلتر هوا", defaultLifespanKm: 10000, defaultLifespanMonths: 12 },
  { name: "لنت ترمز جلو", defaultLifespanKm: 35000, defaultLifespanMonths: 24 },
  { name: "لنت ترمز عقب", defaultLifespanKm: 50000, defaultLifespanMonths: 36 },
  { name: "تسمه تایم", defaultLifespanKm: 60000, defaultLifespanMonths: 48 },
  { name: "تسمه دینام", defaultLifespanKm: 40000, defaultLifespanMonths: 24 },
  { name: "شمع موتور", defaultLifespanKm: 30000, defaultLifespanMonths: 24 },
  { name: "روغن گیربکس", defaultLifespanKm: 50000, defaultLifespanMonths: 36 },
  { name: "باتری خودرو", defaultLifespanKm: 40000, defaultLifespanMonths: 24 },
  { name: "لاستیک‌های جلو", defaultLifespanKm: 60000, defaultLifespanMonths: 48 },
  { name: "مایع خنک‌کننده موتور (ضدیخ)", defaultLifespanKm: 40000, defaultLifespanMonths: 24 },
];

export function MaintenanceTracker({ currentCarModel }: MaintenanceTrackerProps) {
  const activeCar = currentCarModel || "خودروی عمومی";

  // State for tracked records
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  // State for global odometer mileage of the active vehicle
  const [vehicleMileage, setVehicleMileage] = useState<number>(60000);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partNameInput, setPartNameInput] = useState("");
  const [lastDateInput, setLastDateInput] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [lastMileageInput, setLastMileageInput] = useState<string>("55000");
  const [lifespanKmInput, setLifespanKmInput] = useState<string>("7000");
  const [lifespanMonthsInput, setLifespanMonthsInput] = useState<string>("6");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load configuration from localstorage
  useEffect(() => {
    try {
      // Clean vehicle name to save specific data
      const storageKey = `maint_records_${activeCar.trim().toLowerCase()}`;
      const mileageKey = `vehicle_mileage_${activeCar.trim().toLowerCase()}`;

      const savedRecords = localStorage.getItem(storageKey);
      const savedMileage = localStorage.getItem(mileageKey);

      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      } else {
        // Populate standard default recommendations for first time users
        const defaultRecords: MaintenanceRecord[] = [
          {
            id: "default-1",
            carModel: activeCar,
            partName: "روغن موتور و فیلتر روغن",
            lastReplacementDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
              .toISOString()
              .substring(0, 10), // 2 months ago
            lastReplacementMileage: 55000,
            currentMileage: 60000,
            averageLifespanMileage: 7000,
            averageLifespanMonths: 6,
          },
          {
            id: "default-2",
            carModel: activeCar,
            partName: "لنت ترمز جلو",
            lastReplacementDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .substring(0, 10), // 1 year ago
            lastReplacementMileage: 30000,
            currentMileage: 60000,
            averageLifespanMileage: 35000,
            averageLifespanMonths: 24,
          },
        ];
        setRecords(defaultRecords);
        localStorage.setItem(storageKey, JSON.stringify(defaultRecords));
      }

      if (savedMileage) {
        setVehicleMileage(parseInt(savedMileage, 10));
      } else {
        setVehicleMileage(60000);
        localStorage.setItem(mileageKey, "60000");
      }
    } catch (e) {
      console.error("Local storage fail:", e);
    }
  }, [activeCar]);

  // Persist records when they change
  const saveRecordsToStorage = (updatedRecords: MaintenanceRecord[]) => {
    try {
      const storageKey = `maint_records_${activeCar.trim().toLowerCase()}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
    } catch (e) {
      console.error(e);
    }
  };

  // Update overall target mileage
  const handleUpdateMileage = (newVal: number) => {
    if (isNaN(newVal) || newVal < 0) return;
    setVehicleMileage(newVal);
    try {
      const mileageKey = `vehicle_mileage_${activeCar.trim().toLowerCase()}`;
      localStorage.setItem(mileageKey, newVal.toString());

      // Update current mileage in all records to compute remaining health sync
      const updated = records.map((record) => ({
        ...record,
        currentMileage: newVal,
      }));
      saveRecordsToStorage(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Preset picker handler
  const handleSelectPreset = (presetName: string) => {
    const selectedPreset = COMMON_PRESETS.find((p) => p.name === presetName);
    if (selectedPreset) {
      setPartNameInput(selectedPreset.name);
      setLifespanKmInput(selectedPreset.defaultLifespanKm.toString());
      setLifespanMonthsInput(selectedPreset.defaultLifespanMonths.toString());
    }
  };

  // Create new tracking item
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const partName = partNameInput.trim();
    const lastMileage = parseInt(lastMileageInput, 10);
    const lifespanKm = parseInt(lifespanKmInput, 10);
    const lifespanMonths = parseInt(lifespanMonthsInput, 10);

    if (!partName) {
      setValidationError("لطفاً نام قطعه را وارد کنید.");
      return;
    }
    if (isNaN(lastMileage) || lastMileage < 0) {
      setValidationError("کیلومتر زمان تعویض باید عددی مثبت باشد.");
      return;
    }
    if (isNaN(lifespanKm) || lifespanKm <= 0) {
      setValidationError("عمر مفید تعویض (کیلومتر) باید بیشتر از صفر باشد.");
      return;
    }
    if (isNaN(lifespanMonths) || lifespanMonths <= 0) {
      setValidationError("عمر مفید تعویض (بر حسب ماه) باید بیشتر از صفر باشد.");
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: "maint-" + Date.now(),
      carModel: activeCar,
      partName,
      lastReplacementDate: lastDateInput,
      lastReplacementMileage: lastMileage,
      currentMileage: vehicleMileage,
      averageLifespanMileage: lifespanKm,
      averageLifespanMonths: lifespanMonths,
    };

    const updated = [newRecord, ...records];
    saveRecordsToStorage(updated);

    // Reset Form fields
    setPartNameInput("");
    setLastMileageInput(vehicleMileage.toString());
    setLifespanKmInput("7000");
    setLifespanMonthsInput("6");
    setIsFormOpen(false);
  };

  // Delete a record
  const handleDeleteRecord = (id: string) => {
    const filtered = records.filter((r) => r.id !== id);
    saveRecordsToStorage(filtered);
  };

  // Odometer Reset tool: instantly logs the selected part being changed today at the active vehicle mileage
  const handleQuickReset = (record: MaintenanceRecord) => {
    const updated = records.map((r) => {
      if (r.id === record.id) {
        return {
          ...r,
          lastReplacementDate: new Date().toISOString().substring(0, 10),
          lastReplacementMileage: vehicleMileage,
          currentMileage: vehicleMileage,
        };
      }
      return r;
    });
    saveRecordsToStorage(updated);
  };

  // Calculate detailed progress and status for a single logged item
  const getRecordStatus = (record: MaintenanceRecord) => {
    const drivenKm = Math.max(0, vehicleMileage - record.lastReplacementMileage);
    const dateDiffMs = Date.now() - new Date(record.lastReplacementDate).getTime();
    const elapsedDays = Math.max(0, dateDiffMs / (1000 * 60 * 60 * 24));
    const elapsedMonths = elapsedDays / 30.4;

    const kmRatio = drivenKm / record.averageLifespanMileage;
    const timeRatio = elapsedMonths / record.averageLifespanMonths;

    // Use the highest exhaustion factor of either KM or Time
    const exhaustRatio = Math.max(kmRatio, timeRatio);
    const lifePercentageRemaining = Math.max(0, Math.min(100, (1 - exhaustRatio) * 100));
    const lifePercentageSpent = Math.max(0, Math.min(100, exhaustRatio * 100));

    let status: "critical" | "warning" | "ok" = "ok";
    let statusLabel = "سالم / در حال کار";
    let triggerReason = "";

    if (kmRatio >= 1 || timeRatio >= 1) {
      status = "critical";
      statusLabel = "نیاز به تعویض فوری";
      triggerReason = kmRatio >= 1 ? "اتمام عمر مسافتی" : "اتمام عمر زمانی";
    } else if (kmRatio >= 0.8 || timeRatio >= 0.8) {
      status = "warning";
      statusLabel = "بزودی تعویض شود";
      triggerReason = "نزدیک به اتمام ظرفیت فنی";
    }

    return {
      drivenKm,
      elapsedMonths: Math.round(elapsedMonths * 10) / 10,
      lifePercentageSpent: Math.round(lifePercentageSpent),
      lifePercentageRemaining: Math.round(lifePercentageRemaining),
      status,
      statusLabel,
      triggerReason,
      kmRatio,
      timeRatio
    };
  };

  // Dashboard Stats calculation
  const calculatedStats = records.reduce(
    (acc, next) => {
      const { status } = getRecordStatus(next);
      acc[status] += 1;
      acc.total += 1;
      return acc;
    },
    { ok: 0, warning: 0, critical: 0, total: 0 }
  );

  return (
    <div id="maintenance-tracker-workspace" className="space-y-6 text-right animate-fadeIn">
      {/* Overview stats header banner card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 justify-end lg:justify-start mb-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/35 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono">
                محاسب فواصل کیلومتر و زمان
              </span>
              <h2 className="text-lg font-black tracking-tight">{activeCar} - دفترچه هوشمند سرویس</h2>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-sans max-w-2xl">
              آخرین زمان و کیلومتر تعویض قطعات مصرفی ماشین خود را وارد کنید. سیستم بر اساس میانگین عمر مفید قطعه و رفتار کارکرد خودرو، موعد دقیق لنت، روغن، شمع و بقیه قطعات تخصصی را هشدار می‌دهد.
            </p>
          </div>

          {/* Connected Odometer controller inside the header banner */}
          <div className="bg-slate-800/80 border border-slate-700/60 p-4.5 rounded-xl text-right space-y-2 lg:w-80 shadow-md shrink-0">
            <label className="text-[11px] text-slate-350 font-bold block mb-1">
              🚀 کیلومتر فعلی ماشین را بروزرسانی کنید:
            </label>
            <div className="relative">
              <input
                id="vehicle-odometer-editor"
                type="number"
                value={vehicleMileage}
                onChange={(e) => handleUpdateMileage(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 text-left pl-14 pr-4 py-2 text-sm text-blue-400 font-mono font-bold rounded-lg focus:outline-none focus:border-blue-500 tracking-wider"
                placeholder="مثلاً 65000"
              />
              <span className="absolute left-3 top-2.5 text-[10px] font-bold text-slate-500 font-mono">KM</span>
            </div>
            <span className="text-[10px] text-slate-450 block font-medium">
              تغییر این ابزار، وضعیت خستگی تمامی قطعات زیر را همزمان آنالیز می‌کند.
            </span>
          </div>
        </div>

        {/* Dynamic visual badges metrics widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-850">
          <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-slate-400 font-medium font-sans mb-1">قطعات تحت نظارت</span>
            <span className="text-xl font-mono font-black text-white">
              {toPersianNumberString(calculatedStats.total)}
            </span>
          </div>
          <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-emerald-400 font-medium font-sans mb-1">سالم و در حال کار</span>
            <span className="text-xl font-mono font-black text-emerald-400">
              {toPersianNumberString(calculatedStats.ok)}
            </span>
          </div>
          <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-900/30 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-amber-405 text-amber-400 font-medium font-sans mb-1">نیاز به بررسی بزودی</span>
            <span className="text-xl font-mono font-black text-amber-400">
              {toPersianNumberString(calculatedStats.warning)}
            </span>
          </div>
          <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-900/30 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-rose-405 text-rose-400 font-medium font-sans mb-1">نیاز به تعویض فوری</span>
            <span className="text-xl font-mono font-black text-rose-400">
              {toPersianNumberString(calculatedStats.critical)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Logs and Input Panel Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right side Log New Component input panel */}
        <div className="lg:col-span-1 space-y-4">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full flex items-center justify-between gap-2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl cursor-pointer shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-xs font-black">ثبت تعویض قطعه جدید</span>
            </div>
            <span className="text-xs shrink-0 font-medium bg-blue-700 px-2 py-0.5 rounded-lg border border-blue-500/20 text-[10px]">
              {isFormOpen ? "بستن فرم" : "باز کردن"}
            </span>
          </button>

          {/* Form wrapper */}
          {(isFormOpen || records.length === 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-right space-y-4 animate-fadeIn">
              <div className="border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] uppercase font-mono font-bold text-blue-600">ثبت سوابق خدمات لوکال</span>
                <h3 className="font-bold text-xs text-slate-800">مشخصات خدمات انجام شده را وارد کنید</h3>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleAddRecord} className="space-y-4">
                
                {/* Preset quick helper dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">
                    انتخاب سریع از بین قطعات استاندارد:
                  </label>
                  <select
                    id="part-preset-picker"
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    defaultValue=""
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>--- قطعه متبوع را انتخاب کنید ---</option>
                    {COMMON_PRESETS.map((p, i) => (
                      <option key={i} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-slate-100 my-2 pt-2"></div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">
                    * نام دقیق قطعه / سرویس:
                  </label>
                  <input
                    id="new-record-part-name"
                    type="text"
                    value={partNameInput}
                    onChange={(e) => setPartNameInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                    placeholder="مثلاً لنت ترمز جلو ایساکو"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-bold block mb-1">
                      تاریخ تعویض:
                    </label>
                    <input
                      id="new-record-date"
                      type="date"
                      value={lastDateInput}
                      onChange={(e) => setLastDateInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-bold block mb-1">
                      کیلومتر هنگام تعویض:
                    </label>
                    <input
                      id="new-record-mileage"
                      type="number"
                      value={lastMileageInput}
                      onChange={(e) => setLastMileageInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
                      placeholder="مثلاً 55000"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-2 pt-2"></div>

                <div className="grid grid-cols-2 gap-3 bg-blue-50/20 p-2.5 rounded-lg border border-blue-105">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-505 text-slate-650 font-black block mb-0.5">
                      عمر مفید (کیلومتر):
                    </label>
                    <input
                      id="new-record-lifespan-km"
                      type="number"
                      value={lifespanKmInput}
                      onChange={(e) => setLifespanKmInput(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-blue-700 font-black focus:outline-none focus:border-blue-600"
                      placeholder="مثلاً 7000"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-505 text-slate-650 font-black block mb-0.5">
                      عمر مفید (تعداد ماه):
                    </label>
                    <input
                      id="new-record-lifespan-months"
                      type="number"
                      value={lifespanMonthsInput}
                      onChange={(e) => setLifespanMonthsInput(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-blue-700 font-black focus:outline-none focus:border-blue-600"
                      placeholder="مثلاً 6"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  افزودن قطعه به دفترچه سرویس ماشین
                </button>
              </form>
            </div>
          )}

          {/* Quick instructions widget helper */}
          <div className="bg-slate-100/50 border border-slate-200 rounded-2xl p-4.5 text-right text-[11px] leading-relaxed text-slate-500 space-y-2 font-medium">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1 justify-end">
              <span>راهنمای دفترچه سرویس نگهداری</span>
              <Info className="w-4 h-4 text-slate-500" />
            </h4>
            <p>
              وقتی مسافت طی‌شده قطعه یا زمان نصب آن به مرز معینی می‌رسد، سیستم وضعیت آن را به حالت زرد رنگ (هشدار) یا قرمز (فوری) تغییر می‌دهد.
            </p>
            <p>
              با زدن دکمه <strong className="text-slate-700">«کارکرد تازه شد»</strong> در هر قطعه، تاریخ و کیلومتر تعویض آن بر روی کیلومتر زمان واقعی خودرو بروزرسانی می‌شود.
            </p>
          </div>
        </div>

        {/* Left side tracked components layout */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">لیست قطعات تحت پایش ماشین شما</h3>
              </div>
              <span className="text-[10px] text-slate-450 font-bold bg-slate-100/80 px-2 py-0.5 rounded-lg border border-slate-200 font-mono">
                {activeCar}
              </span>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-3xl">📭</div>
                <h4 className="font-bold text-sm text-slate-600">هنوز قطعه‌ای را ثبت نکرده‌اید!</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                  از فرم سمت راست قطعات دلخواه (روغن موتور، دیسک‌های ترمز، لنت ترمز و غیره) را ثبت کنید تا سیستم پایش تعویض آنلاین برای شما شروع به کار کند.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto pr-1">
                {records.map((record) => {
                  const stat = getRecordStatus(record);
                  return (
                    <div
                      key={record.id}
                      id={`maint-card-${record.id}`}
                      className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-5 transition-all hover:bg-slate-50/50 px-2 rounded-xl"
                    >
                      {/* Left: Metadata & dynamic progress gauge bar chart */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-black text-slate-800 text-sm">{record.partName}</h4>
                          
                          {/* Badge dynamic replacement indicators */}
                          {stat.status === "critical" && (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>نیاز به تعویض فوری! ({toPersianNumberString(stat.lifePercentageSpent)}٪ مصرف شده)</span>
                            </span>
                          )}
                          {stat.status === "warning" && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>به زودی بررسی شود ({toPersianNumberString(stat.lifePercentageSpent)}٪ مصرف شده)</span>
                            </span>
                          )}
                          {stat.status === "ok" && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>سالم و اوکی (کارکرد خوب)</span>
                            </span>
                          )}
                        </div>

                        {/* Descriptive timeline dates */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-slate-500 font-sans">
                          <div className="flex items-center gap-1.5 justify-end md:justify-start">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>نصب در کیلومتر: {toPersianNumberString(record.lastReplacementMileage)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end md:justify-start">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>نصب در تاریخ: {toPersianNumberString(record.lastReplacementDate)}</span>
                          </div>
                          <div className="col-span-2 md:col-span-1 flex items-center gap-1.5 justify-end md:justify-start">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            <span>کارکرد قطعه: <strong className="text-slate-700 font-bold">{toPersianNumberString(stat.drivenKm)} کیلومتر</strong></span>
                          </div>
                        </div>

                        {/* Customized visual slider indicator progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 px-0.5">
                            <span className="font-mono">عمر قطعه: ۲ ظرفیت زمانی و مسافتی</span>
                            <span className="font-mono text-slate-500 font-bold">
                              {toPersianNumberString(stat.lifePercentageSpent)}٪ ظرفیت تخلیه شده
                            </span>
                          </div>
                          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative flex">
                            {/* Visual highlight colored fill bar */}
                            <div
                              className={`h-full transition-all duration-300 rounded-l-md ${
                                stat.status === "critical"
                                  ? "bg-rose-500"
                                  : stat.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${stat.lifePercentageSpent}%` }}
                            ></div>
                            
                            {/* Inner absolute centering numeric indicator */}
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black pointer-events-none drop-shadow-xs text-slate-705">
                              {stat.lifePercentageRemaining > 0 
                                ? `${toPersianNumberString(stat.lifePercentageRemaining)}٪ سلامتی باقیمانده` 
                                : "باید فوراً عوض شود"}
                            </span>
                          </div>
                        </div>

                        {/* Critical thresholds descriptors details */}
                        <div className="flex flex-wrap items-center gap-3.5 text-[10px] text-slate-450 border-t border-slate-50/80 pt-1.5">
                          <span>
                            آستانه مسافتی: <strong className="text-slate-600">{toPersianNumberString(record.averageLifespanMileage)} کیلومتر</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            آستانه زمانی: <strong className="text-slate-600">{toPersianNumberString(record.averageLifespanMonths)} ماه</strong> (کارکرد واقعی زمان: {toPersianNumberString(stat.elapsedMonths)} ماه)
                          </span>
                        </div>
                      </div>

                      {/* Right: Quick actions (Refresh replace counters + Delete) */}
                      <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between sm:justify-start gap-2.5 md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickReset(record)}
                          title="ثبت مجدد تعویض قطعه در کیلومتر امروز"
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-550 group-hover:rotate-180" />
                          <span>کارکرد تازه شد</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                          title="حذف از دفترچه پایش"
                          className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer focus:outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
