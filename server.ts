import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely if key is available
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set.");
}

// DeepSeek API Fallback Helper
async function tryDeepSeek(prompt: string): Promise<string | null> {
  const dKey = process.env.DEEPSEEK_API_KEY;
  if (!dKey) return null;
  const url = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";
  try {
    console.log("DeepSeek request initiated...");
    const res = await fetch(`${url}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });
    const parsed = await res.json();
    return parsed?.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("DeepSeek API error:", e);
    return null;
  }
}

// Ollama API Fallback Helper
async function tryOllama(prompt: string): Promise<string | null> {
  const url = process.env.OLLAMA_API_URL || "http://localhost:11434";
  try {
    console.log("Ollama request initiated...");
    const res = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });
    const parsed = await res.json();
    return parsed?.response || null;
  } catch (e) {
    console.error("Ollama fallback error:", e);
    return null;
  }
}

// Local offline fallback database simulator (Tailored perfectly to Iranian auto market with realistic 2026 post-inflation rates)
function generateOfflineCarParts(carModel: string, specifications?: string) {
  const isForeign = /(کیا|هیوندای|لکسوس|تویوتا|بنز|ب‌ام‌و|بی‌ام‌و|جک|چری|ام‌وی‌ام|mvm|هایما|فیدلیتی|دیگنیتی|تیگو|لاماری|اپتیما|سوناتا|اسپورتیج|توسان|سانتافه|سراتو|مگان|مزدا|نیسان|شاسی|بسترن|بایک|جیلی|ام‌جی)/i.test(carModel);
  const expenseLevel = isForeign ? "بالا" : "متوسط";
  const normalizedCarName = carModel.trim();
  
  const summary = isForeign 
    ? `بررسی کارشناسی و فنی خودروی ${normalizedCarName} نشان می‌دهد این خودرو با توجه به پیشرانه مدرن و حساس خود، نیاز مبرمی به سرویس‌های منظم دوره‌ای مخصوصاً تعویض به‌موقع روغن‌های تمام‌سنتتیک دارد. به سبب استفاده از قطعات باکیفیت خارجی، هزینه‌های استهلاک و لوازم یدکی آن در بازار اصلی لوازم یدکی و قطعات تهران نسبتاً بالاست ولی عمر مفید قطعات طولانی‌تر است. توصیه می‌شود حتماً از برندهای جنیون پارت یا کره‌ای و آلمانی معتبر استفاده شود.`
    : `خودروی ${normalizedCarName} دارای استهلاک متداول بوده و دسترسی به قطعات یدکی آن در سراسر ایران بسیار آسان و با قیمت‌های رقابتی است. به دلیل کیفیت متوسط قطعات شرکتی، توصیه می‌شود سرویس‌های پنج هزارتایی روغن و فیلترها به موقع انجام شود تا عمر مفید موتور حفظ گردد. برندهای ایساکو، سایپا یدک و مارک‌های رسمی تحت پوشش در بازار اصلی لوازم یدکی و قطعات تهران انتخاب‌های مطمئنی هستند.`;

  const categories = [
    {
      categoryName: "روغن‌ها و مواد روان‌کننده",
      parts: [
        {
          partName: isForeign ? "روغن موتور 5W-40 وارداتی تمام‌سنتتیک (۴ لیتری)" : "روغن موتور 10W-40 نیمه‌سنتتیک (۴ لیتری)",
          priceRange: isForeign ? { min: 3800000, max: 6500000 } : { min: 1450000, max: 2300000 },
          lifetime: "۸,۰۰۰ کیلومتر یا ۶ ماه",
          replacementSigns: "سیاه شدن شدید مایع، صدای خشن سوپاپ‌ها هنگام استارت سرد، کاهش عملکرد و افت ویسکوزیته",
          suggestedBrands: isForeign ? ["کاسترول (Castrol)", "لیکومولی (Liqui Moly)", "ادینول (Addinol)"] : ["بهران سوپر پیشتاز", "کاسپین", "اسپیدی"],
          installDifficulty: "متوسط (نیاز به ابزار ساده)",
          proTip: isForeign ? "هرگز از روغن‌های با سطح کیفی پایین‌تر از SN برای موتورهای توربو استفاده نکنید." : "همراه با هر بار تعویض روغن، حتماً فیلتر روغن را هم تعویض کنید."
        },
        {
          partName: isForeign ? "روغن گیربکس اتوماتیک ATF اصلی (لیتری)" : "روغن گیربکس دستی (لیتری)",
          priceRange: isForeign ? { min: 2200000, max: 3900000 } : { min: 750000, max: 1450000 },
          lifetime: "۵۰,۰۰۰ کیلومتر یا ۲ سال",
          replacementSigns: "سفت جا رفتن دنده‌ها، تقه زدن گیربکس اتوماتیک، زوزه کشیدن جعبه‌دنده",
          suggestedBrands: isForeign ? ["آیسین (Aisin)", "هیوندای اکستیر SP4", "موبیل ۱"] : ["بهران سمند", "ایساکو", "کاسپین"],
          installDifficulty: "سخت (نیاز به مکانیک)",
          proTip: "روغن گیربکس اتوماتیک باید با دستگاه مخصوص تخلیه کامل شود تا رسوب‌های پشت شیربرقی‌ها کاملاً خارج شوند."
        }
      ]
    },
    {
      categoryName: "سیستم ترمز",
      parts: [
        {
          partName: isForeign ? "لنت ترمز جلو سرامیکی درجه‌یک وارداتی" : "لنت ترمز جلو شرکتی باکیفیت",
          priceRange: isForeign ? { min: 4200000, max: 8500000 } : { min: 1350000, max: 2650000 },
          lifetime: "۳۵,۰۰۰ تا ۵۰,۰۰۰ کیلومتر",
          replacementSigns: "صدای سوت هنگام ترمزگیری، روشن شدن چراغ هشدار لنت، کاهش سطح مایع ترمز",
          suggestedBrands: isForeign ? ["الیگ (Elig)", "تکستار (Textar)", "جنیون پارت اصلی"] : ["پارس لنت", "الیگ سبز", "امکو (Emco)"],
          installDifficulty: "متوسط (نیاز به ابزار ساده)",
          proTip: "در زمان تعویض لنت حتماً از استادکار بخواهید پین‌های کالیپر ترمز را روان‌کاری کند تا لنت‌ها یکنواخت خورده شوند."
        },
        {
          partName: "دیسک ترمز چرخ جلو (جفت)",
          priceRange: isForeign ? { min: 7500000, max: 16500000 } : { min: 2950000, max: 5450000 },
          lifetime: "۸۰,۰۰۰ کیلومتر",
          replacementSigns: "لرزش محسوس پدال ترمز و فرمان در سرعت‌های بالا هنگام ترمز گرفتن، وجود لبه عمیق روی دیسک",
          suggestedBrands: isForeign ? ["برمبو (Brembo)", "تی‌آردبلیو (TRW)", "ماندو کره‌ای"] : ["لایبر (Liber)", "ایساکو شرکتی", "توسن"],
          installDifficulty: "سخت (نیاز به مکانیک)",
          proTip: "هرگز بلافاصله بعد از رانندگی طولانی به کارواش نروید؛ برخورد مستقیم آب سرد با دیسک داغ موجب تاب برداشتن آن می‌شود."
        }
      ]
    },
    {
      categoryName: "بخش برقی و جرقه",
      parts: [
        {
          partName: isForeign ? "شمع موتور ایریدیوم لیزری پایه بلند (یک دست ۴تایی)" : "شمع موتور سوزنی درجه‌یک (یک دست ۴تایی)",
          priceRange: isForeign ? { min: 4500000, max: 9300000 } : { min: 1600000, max: 3200000 },
          lifetime: isForeign ? "۸۰,۰۰۰ کیلومتر" : "۳۰,۰۰۰ کیلومتر",
          replacementSigns: "لرزش موتور در دور آرام (درجا کار کردن)، افزایش مصرف سوخت، شتاب تنبل، خام‌سوزی اگزوز",
          suggestedBrands: isForeign ? ["ان‌جی‌کی (NGK)", "دنسو (Denso)", "بوش ایریدیوم"] : ["ان‌جی‌کی سوزنی ژاپن", "بوش روسیه", "اکیوم (Eyquem)"],
          installDifficulty: "متوسط (نیاز به ابزار ساده)",
          proTip: "همیشه قبل از بستن شمع جدید، فیلر دهانه شمع (گپ شمع) را متناسب با دفترچه راهنمای خودرو تنظیم کنید."
        },
        {
          partName: "باتری اتمی خودرو (۶۰ تا ۷۴ آمپر)",
          priceRange: isForeign ? { min: 3900000, max: 6800000 } : { min: 2400000, max: 4400000 },
          lifetime: "۲ سال یا ۴۰,۰۰۰ کیلومتر",
          replacementSigns: "سنگین استارت خوردن ماشین در هوای سرد، دشارژ شدن خودکار، تغییر شکل پوسته باتری",
          suggestedBrands: ["سپاهان باتری (کیت اوربیتال)", "صبا باتری (واریان)", "برنا باتری"],
          installDifficulty: "آسان (توسط راننده)",
          proTip: "سولفاته‌ بر روی قطب‌های باتری را با آب جوش تمیز کنید و کمی گریس بزنید تا انتقال جریان بهتر صورت گیرد."
        }
      ]
    },
    {
      categoryName: "فیلترها",
      parts: [
        {
          partName: "فیلتر هوای موتور",
          priceRange: isForeign ? { min: 580000, max: 1200000 } : { min: 180000, max: 450000 },
          lifetime: "۱۰,۰۰۰ کیلومتر",
          replacementSigns: "سیاهی کاغذ صافی، کم شدن شتاب موتور، تولید دوده سیاه خفیف در گاز دادن ناگهانی",
          suggestedBrands: isForeign ? ["مان فیلتر", "بوش (Bosch)", "جنیون اصل"] : ["سرکان", "به‌ران", "کاج فیلتر"],
          installDifficulty: "آسان (توسط راننده)",
          proTip: "هرگز فیلتر هوا را باد نگیرید! ذرات گرد و غبار میکرونی از منافذ صافی عبور کرده و دیواره سیلندر را دستخوش سایش می‌کنند."
        },
        {
          partName: "فیلتر کابین (تهویه مطبوع کربن فعال)",
          priceRange: isForeign ? { min: 480000, max: 1100000 } : { min: 170000, max: 390000 },
          lifetime: "۱۵,۰۰۰ کیلومتر",
          replacementSigns: "کاهش پرتاب باد کولر و بخاری، بوی نم و رطوبت نامطبوع هنگام روشن کردن فن",
          suggestedBrands: ["سرکان", "بوش", "پارت لاستیک"],
          installDifficulty: "آسان (توسط راننده)",
          proTip: "فیلترهای کابین کربن فعال قدرت مهار بوهای نامطبوع محیط اطراف و بنزین جاده را دارند."
        }
      ]
    },
    {
      categoryName: "تسمه‌ها",
      parts: [
        {
          partName: isForeign ? "کیت کامل تسمه تایمینگ و هرزگردها اصلی" : "کیت تسمه تایم شرکتی مناسب خودرو",
          priceRange: isForeign ? { min: 8800000, max: 18500000 } : { min: 2200000, max: 4800000 },
          lifetime: "۶۰,۰۰۰ کیلومتر یا ۴ سال",
          replacementSigns: "صدای تیک‌تیک مداوم از جلوی موتور، وجود ترک‌های ریز در شیارهای هرزگرد تسمه، افت شدید شتاب",
          suggestedBrands: isForeign ? ["پاورگریپ (Gates)", "کنتیننتال آلمانی", "جنیون پارت کلاچ"] : ["پاورگریپ اصلی باکس قرمز", "دانگیل کره", "کنتیننتال"],
          installDifficulty: "سخت (نیاز به مکانیک)",
          proTip: "همیشه بلبرینگ‌های هرزگرد و سفت‌کن را همزمان با خود تسمه تایم نو تعویض کنید تا بلبرینگ کهنه گریپاژ نکند و تسمه نو پاره نشود."
        }
      ]
    }
  ];

  let partsCount = 0;
  categories.forEach(c => {
    partsCount += c.parts.length;
  });

  const commonTroubles = isForeign ? [
    {
      symptom: "روشن شدن چراغ چک همراه با لرزش ملایم در کابین",
      possibleCause: "خرابی کوئل یا خام‌سوزی ناشی از شمع‌های فرسوده به سبب نفوذ سوخت‌های ناخالص",
      urgentLevel: "نارنجی (نیاز به مراجعه زودهنگام)"
    },
    {
      symptom: "تقه زدن محسوس گیربکس اتوماتیک موقع تغییر حالت از D به R یا بلعکس",
      possibleCause: "ضعیف شدن کالیبره شیربرقی‌های گیربکس یا افت سطح روغن و رسوبات در فیلتر هیدرولیک گیربکس",
      urgentLevel: "قرمز (خطرناک - توقف خودرو)"
    }
  ] : [
    {
      symptom: "صدای تق‌تق یا لق‌لق شدید موقع چرخاندن کامل فرمان به طرفین",
      possibleCause: "پاره شدن سریع گردگیر پلوس چرخ جلو و تخلیه گریس که سبب ساییدگی جدی پلوس شده است",
      urgentLevel: "زرد (قابل بررسی)"
    },
    {
      symptom: "بالا رفتن سریع آمپر آب رادیاتور در ترافیک شهری با روشن بودن کولر",
      possibleCause: "نیم‌سوز شدن فیوز کالسکه فن، کثیفی پره‌های رادیاتور یا هوا داشتن سیستم خنک‌کننده در موتورهای داخلی",
      urgentLevel: "قرمز (خطرناک - توقف خودرو)"
    }
  ];

  return {
    carModelName: normalizedCarName,
    summary,
    overallExpenseLevel: expenseLevel,
    partsCount,
    categories,
    commonTroubles,
    isOfflineData: true
  };
}

// Local offline fallback chat helper
function generateOfflineChatReply(carModel: string, partName: string, userMessage: string): string {
  const normMsg = userMessage.toLowerCase();
  
  const isOffTopic = /(کدنویسی|برنامه نویسی|برنامه‌نویسی|آشپزی|پایتون|جاوا|کیک|شعر|حافظ|سیاست|پزشکی|دکتر|آهنگ|موسیقی|فیلم|سینما|تاریخ|جغرافیا)/i.test(normMsg);
  if (isOffTopic) {
    return `کاربر گرامی و دوست عزیز! حوزه تخصصی اینجانب صرفاً مشاوره فنی خودرو، بررسی عیب‌های مکانیکی و برآورد قیمت قطعات یدکی است و از پاسخ‌گویی به مباحث متفرقه خارج از این حوزه معذورم. خوشحال می‌شوم سوالات تخصصی درباره خودروی ${carModel} را با بنده در میان بگذارید تا با هم بررسی کنیم.`;
  }

  if (normMsg.includes("اجرت") || normMsg.includes("دستمزد") || normMsg.includes("تعویض")) {
    return `کاربر گرامی و دوست عزیز! در خصوص دستمزد و اجرت تعویض قطعه در خودروی «${carModel}» بر اساس آخرین نرخ‌نامه مصوب اتحادیه تعمیرکاران خودرو، هزینه‌های تقریبی به شرح زیر برآورد می‌شود:
۱. اجرت تعویض لنت جلو: حدود ۳۰۰,۰۰۰ تا ۴۵۰,۰۰۰ تومان
۲. اجرت تعویض روغن و فیلترهای مصرفی (سرویس دوره‌ای کامل): حدود ۲۰۰,۰۰۰ تا ۳۵۰,۰۰۰ تومان
۳. اجرت تعویض تسمه تایم و بلبرینگ‌های هرزگرد مرتبط: حدود ۱,۵۰۰,۰۰۰ تا ۲,۸۰۰,۰۰۰ تومان (بسته به مدل پیشرانه خودرو)
توصیه می‌شود همواره از تعمیرکار مجاز بخواهید دیسک‌های چرخ و رگلاژ کلی را جهت ایمنی بیشتر بررسی کند. در صورت نیاز به راهنمایی بیشتر، آماده پاسخ‌گویی به شما هستم.`;
  }
  
  if (normMsg.includes("خرید") || normMsg.includes("دیجی") || normMsg.includes("دیجیکالا") || normMsg.includes("اصل") || normMsg.includes("تقلبی")) {
    return `دوست عزیز و کاربر گرامی! برای خرید قطعات خودروی «${carModel}» مخصوصاً قطعه مورد نظر شما یعنی «${partName || "لوازم یدکی مصرفی"}»، چند قانون کلیدی را جهت تهیه قطعات با اصالت مدنظر قرار دهید:
۱. در اولین مرحله قیمت‌های روز کالا را از پلتفرم‌های آنلاینی همچون دیجی‌کالا (digikala.com) استعلام بگیرید تا بازخورد خریداران قبلی را بررسی کنید. همچنین موتورهای جستجوی کالا نظیر ترب (torob.com) و مراجع اختصاصی مانند یدک‌کالا و یدک‌یاب برای مقایسه قیمت‌های فروشندگان در سراسر کشور سودمند هستند.
۲. هنگام حضور در بازار اصلی لوازم یدکی و قطعات معتبر تهران، حتماً از فروشنده درخواست شناسه رهگیری وزارت صمت و بارکد اصالت قطعه را داشته باشید.
۳. توجه داشته باشید که اختلاف قیمت‌های بسیار شدید با عرف بازار معمولاً نشانه قطعات غیراصل یا بازسازی شده است؛ در انتخاب قطعات حساس همواره کیفیت را فدای قیمت پایین‌تر نکنید.`;
  }

  if (normMsg.includes("روغن") || normMsg.includes("لیکومولی") || normMsg.includes("بهران") || normMsg.includes("کاسترول")) {
    return `کاربر گرامی! استفاده از روان‌کننده با شاخص گرانروی مناسب برای خودروی «${carModel}» نقشی حیاتی در دوام قطعات پیشرانه دارد.
اگر خودروی شما دارای سیستم پیشرانه معمولی یا مدل‌های متداول داخلی است، استفاده از روغن موتور نیمه‌سنتتیک با شاخص استاندارد 10W-40 (نظیر بهران سوپر پیشتاز طلایی یا اسپیدی) مطلوب خواهد بود.
در صورتی که خودروی شما مجهز به موتور توربوشارژ یا از مدل‌های وارداتی حساس است، حتماً از روغن‌های تمام‌سنتتیک با ویسکوزیته مناسب نظیر 5W-30 یا 5W-40 (از برندهای تایید شده مانند کاسترول مگناتک یا لیکومولی) استفاده فرمایید و توصیه می‌کنیم در هر مرتبه سرویس، فیلتر روغن نیز تعویض شود.`;
  }

  return `دوست عزیز و کاربر گرامی! بنده اوس عماد، کارشناس و مشاور فنی لوازم یدکی و قطعات خودور هستم. در خصوص خودروی «${carModel}» و قطعه مورد نظر شما «${partName || "لوازم مصرفی کلی"}»، ارزیابی‌های مربوطه انجام شده است.
همواره توجه داشته باشید که رانندگی ایمن و اصولی در دور موتور بهینه، به همراه انجام سرویس‌های دوره‌ای منظم، هزینه‌های نگهداری را به طور چشمگیری کاهش می‌دهد. برای خرید آگاهانه، توصیه می‌شود ابتدا قیمت قطعات را از چند مرجع آنلاین شناخته شده نظیر دیجی‌کالا, ترب، یدک‌کالا و سایر مراکز تخصصی استعلام بفرمایید تا قیمت عادلانه مشخص شود.
چنانچه قصد استعلام اجرت نصب، عیب‌یابی علائم خرابی یا هرگونه مشاوره فنی دیگری را دارید، بفرمایید تا راهنمایی‌تان کنم. با احترام.`;
}

// API endpoint to get car consumable parts in Persian
app.post("/api/car-parts", async (req, res) => {
  const { carModel, specifications } = req.body;

  if (!carModel || typeof carModel !== "string") {
    return res.status(400).json({ error: "لطفاً مدل خودرو را به درستی وارد کنید." });
  }

  try {
    const prompt = `
تو یک تعمیرکار متخصص، کارشناس نگهداری خودرو و تحلیل‌گر بازار لوازم یدکی و قطعات خودرو در ایران هستی.
همیشه و قبل از پیاده‌سازی نتایج فیلدها، با ابزار جستجوی گوگل (Google Search) قیمت زنده هر یک از قطعات مصرفی خودروی "${carModel}" را با وب تحقیق و استعلام کن:
۱. در اولین مرحله سعی کن قیمت‌ها را در سایت دیجی کالا (digikala.com) به‌دست آوری.
۲. اگر قطعه‌ای یافت نشد یا در دیجی کالا موجود نبود، به سراغ نتایج دیگر وب و معتبرترین فروشگاه‌های قطعات یدکی و قطعه‌سازان در ایران (مثل ترب torob.com، یدک کالا yadakkala.com، یدک‌یاب و غیره) یا استعلام از صنف قطعات یدکی و لوازم مصرفی خودروی تهران برو.

کاربر مشخصات زیر را برای دریافت لیست قطعات مصرفی خودرو فرستاده است:
نام/مدل خودرو: ${carModel}
توضیحات/شرایط اختیاری: ${specifications || "معمولی / استاندارد"}

یک بررسی دقیق، کاملاً واقعی، نهایی و سازمان‌دهی شده به زبان فارسی شيرين و روان برای قطعات مصرفی این خودرو طبق قیمت‌های روز بازار ایران در سال ۱۴۰۵ (سال ۲۰۲۶) بر حسب "تومان" آماده کن.
پاسخ باید دقیقاً در قالب ساختار JSON زیر باشد. هیچ کلام اضافه‌ای بیرون از فرمت JSON ننویس. تمامی مقادیر متنی و توضیحات باید کاملاً به زبان فارسی باشد.

ساختار JSON مورد نظر:
{
  "carModelName": "نام رسمی و کامل خودرو به فارسی",
  "summary": "یک پاراگراف چکیده درباره هزینه‌های نگهداری، استهلاک، و توصیه‌های کلیدی سرویس دوره‌ای این خودرو",
  "overallExpenseLevel": "کم / متوسط / بالا / بسیار بالا",
  "partsCount": 15, // تعداد کل قطعات لیست شده
  "categories": [
    {
      "categoryName": "عنوان دسته‌بندی (مثلاً: روغن‌ها و مواد روان‌کننده، سیستم ترمز، سیستم تعلیق و جلوبندی، بخش برقی و جرقه، تسمه‌ها، فیلترها و سایر موارد)",
      "parts": [
        {
          "partName": "نام دقیق قطعه به فارسی (مثلاً روغن موتور 10W-40 چهار لیتری)",
          "priceRange": {
            "min": 450000, // حداقل قیمت حدودی به تومان به صورت عدد خام (تومان)
            "max": 800000  // حداکثر قیمت حدودی به تومان به صورت عدد خام (تومان)
          },
          "lifetime": "مقدار عمر مفید خودرو بر حسب کیلومتر یا زمان (مثلاً: ۸,۰۰۰ کیلومتر یا ۶ ماه)",
          "replacementSigns": "علائم خرابی یا نیاز به تعویض (مثلاً: سیاه شدن مایع، صدای سوت، خشکی فرمان)",
          "suggestedBrands": ["نام برندهای معروف و باکیفیت مناسب این ماشین در بازار ایران"],
          "installDifficulty": "آسان (توسط راننده) / متوسط (نیاز به ابزار ساده) / سخت (نیاز به مکانیک)",
          "proTip": "یک توصیه یا ترفند کوتاه فنی درباره خرید یا نگهداری این قطعه خاص"
        }
      ]
    }
  ],
  "commonTroubles": [
    {
      "symptom": "نشانه یا صدای غیرعادی خاص این خودرو (مثلاً صدای تق تق هنگام عبور از دست‌انداز)",
      "possibleCause": "علت احتمالی مربوط به بخش مصرفی (مثلاً خرابی بوش طبق یا کمک‌فنرها)",
      "urgentLevel": "زرد (قابل بررسی) / نارنجی (نیاز به مراجعه زودهنگام) / قرمز (خطرناک - توقف خودرو)"
    }
  ]
}

دقت بفرما که قیمت‌ها کاملاً عاقلانه، معتبر و منطبق بر محدوده بازار لوازم یدکی ایران باشد. برای پراید، پژو، سمند، تندر، دنا، شاهین، تارا، یا انواع خودروهای خارجی (کیا، هیوندای، تویوتا، چینی‌ها و غیره) متناسب با کلاس خودرو قیمت‌گذاری کن.
تمام کلیدها و فیلدها انگلیسی باشند اما ارزش‌ها و توضیحاتشان فارسی باشند.
`;

    const configBase: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: [
          "carModelName",
          "summary",
          "overallExpenseLevel",
          "partsCount",
          "categories",
          "commonTroubles",
        ],
        properties: {
          carModelName: { type: Type.STRING },
          summary: { type: Type.STRING },
          overallExpenseLevel: { type: Type.STRING },
          partsCount: { type: Type.INTEGER },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["categoryName", "parts"],
              properties: {
                categoryName: { type: Type.STRING },
                parts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: [
                      "partName",
                      "priceRange",
                      "lifetime",
                      "replacementSigns",
                      "suggestedBrands",
                      "installDifficulty",
                      "proTip",
                    ],
                    properties: {
                      partName: { type: Type.STRING },
                      priceRange: {
                        type: Type.OBJECT,
                        required: ["min", "max"],
                        properties: {
                          min: { type: Type.INTEGER },
                          max: { type: Type.INTEGER },
                        },
                      },
                      lifetime: { type: Type.STRING },
                      replacementSigns: { type: Type.STRING },
                      suggestedBrands: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      installDifficulty: { type: Type.STRING },
                      proTip: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
          commonTroubles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["symptom", "possibleCause", "urgentLevel"],
              properties: {
                symptom: { type: Type.STRING },
                possibleCause: { type: Type.STRING },
                urgentLevel: { type: Type.STRING },
              },
            },
          },
        },
      },
    };

    let finalJSONOutput: any = null;

    if (ai) {
      try {
        console.log("Attempting Generation: gemini-3.5-flash + search...");
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            ...configBase,
            tools: [{ googleSearch: {} }],
          },
        });
        if (response.text) finalJSONOutput = JSON.parse(response.text.trim());
      } catch (err1: any) {
        console.warn("Attempt 1 failed (gemini-3.5-flash + googleSearch):", err1.message || err1);
        try {
          console.log("Attempting Fallback 1: gemini-3.1-flash-lite + search...");
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              ...configBase,
              tools: [{ googleSearch: {} }],
            },
          });
          if (response.text) finalJSONOutput = JSON.parse(response.text.trim());
        } catch (err2: any) {
          console.warn("Attempt 2 failed (gemini-3.1-flash-lite + googleSearch):", err2.message || err2);
          try {
            console.log("Attempting Fallback 2: gemini-3.5-flash WITHOUT search...");
            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
              config: configBase,
            });
            if (response.text) finalJSONOutput = JSON.parse(response.text.trim());
          } catch (err3: any) {
            console.warn("Attempt 3 failed (gemini-3.5-flash without googleSearch):", err3.message || err3);
            try {
              console.log("Attempting Final Fallback 3: gemini-3.1-flash-lite WITHOUT search...");
              const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: configBase,
              });
              if (response.text) finalJSONOutput = JSON.parse(response.text.trim());
            } catch (err4) {
              console.warn("All Gemini fallbacks failed:", err4);
            }
          }
        }
      }
    }

    // Try DeepSeek if Gemini didn't produce an output
    if (!finalJSONOutput && process.env.DEEPSEEK_API_KEY) {
      try {
        console.log("Attempting Fallback: DeepSeek API...");
        const dsText = await tryDeepSeek(prompt);
        if (dsText) {
          finalJSONOutput = JSON.parse(dsText.trim());
        }
      } catch (e) {
        console.warn("DeepSeek fallback parsing failed:", e);
      }
    }

    // Try Ollama if Gemini and DeepSeek didn't produce an output
    if (!finalJSONOutput) {
      try {
        console.log("Attempting Fallback: Ollama Local...");
        const ollamaText = await tryOllama(prompt);
        if (ollamaText) {
          finalJSONOutput = JSON.parse(ollamaText.trim());
        }
      } catch (e) {
        console.warn("Ollama fallback parsing failed:", e);
      }
    }

    // Secure/Failproof absolute fallback to offline simulation
    if (!finalJSONOutput) {
      console.log("Triggering failsafe high-fidelity offline simulator...");
      finalJSONOutput = generateOfflineCarParts(carModel, specifications);
    }

    return res.json(finalJSONOutput);
  } catch (error: any) {
    console.error("AI Generation Critical Error, falling back to offline simulation anyway:", error);
    try {
      const offlineOutput = generateOfflineCarParts(carModel, specifications);
      return res.json(offlineOutput);
    } catch (fallbackErr) {
      return res.status(500).json({
        error: "خطای مهلک در شبیه‌ساز آفلاین خودرو. لطفا مجددا تلاش کنید.",
      });
    }
  }
});

// Extra Q&A Chat endpoint for custom user queries regarding the analyzed car (e.g. asking for diy tips)
app.post("/api/car-parts/chat", async (req, res) => {
  const { carModel, partName, userMessage, chatHistory } = req.body;

  if (!carModel || !userMessage) {
    return res.status(400).json({ error: "مدل خودرو و پیام کاربر الزامی هستند." });
  }

  const chatInstruction = `تو یک کارشناس و مشاور فنی لوازم یدکی و قطعات خودروی مجرب، با حوصله و با سلیقه ایرانی هستی که به زبان رسمی، محترمانه و در عین حال صمیمی به کاربران کمک می‌کنی. نام تخصص تو "اوس عماد" است. اطلاعات بسیار کاملی درباره خودروها، قطعات یدکی، لوازم مصرفی، نحوه فیلتر کردن قطعه تقلبی از اصلی، هزینه‌های واقعی اجرت تعویض در صنف مکانیک‌های ایران داری. 
اگر کاربر درباره قیمت و خرید قطعه‌ای سوالی پرسید یا استعلام قیمت کارخانه و بازار خواست، با ابزار گوگل سرچ که در اختیار داری قیمت را مستقیماً از سایت دیجی‌کالا (digikala.com) استعلام کن و اگر موجود نداشت، از بهترین مراجع آنلاین لوازم یدکی ایران (مثل ترب torob.com، یدک کالا یا یدک‌یاب) قیمت معتبر و به‌روز بده.
همیشه راهنمایی‌های ملموس، ترفندهای دقیق و علائم قطعی نقص فنی را ارائه کن. کاربر درباره خودرو "${carModel}" و احتمالاً قطعه خاص "${partName || "عمومی"}" سوالی دارد. به زبان فارسی پاسخ بده و از اصطلاحات فنی استاندارد صنف تعمیرکاران با احتیاط و جذاب استفاده کن (مانند آب‌بندی، سه کار کردن، رگلاژ، واشر زدن، یاتاقان، کمپرس سیلندر و غیره).

قوانین بسیار سخت‌گیرانه و حیاتی:
۱. همواره از لحن رسمی، بسیار مودبانه و محترمانه استفاده کن. هرگز از عبارات صمیمی مفرط یا غیررسمی مانند "داداش گلم"، "آبجی گرامی"، "رفیق باوفا"، "مشتی"، "سالار" استفاده نکن. به جای آن حتماً عباراتی نظیر "کاربر گرامی"، "دوست عزیز" یا "همراه محترم" را به کار ببر.
۲. هرگز از اصطلاح "بازار چراغ برق" استفاده نکن. به جای آن همیشه عبارت "بازار اصلی لوازم یدکی و قطعات تهران" یا "مراکز معتبر لوازم یدکی خودرو در تهران" را به کار ببر.
۳. تو فقط و فقط مجاز هستی در محدوده مباحث خودرو، فنی ماشین، عیب‌یابی مکانیکی، جلوبندی، گیربکس، خرید و قیمت دیسک و صفحه، باتری، تسمه‌ها، روغن موتور و قطعات یدکی اتومبیل پاسخ دهی. 
۴. اگر کاربر سوالی فراتر یا کاملاً خارج از این حوزه (مثال: برنامه‌نویسی، آشپزی، سیاست، شعر، جغرافیا، پزشکی، موسیقی یا امور متفرقه کاری) پرسید، هرگز به آن سوال غیرخودرویی یا علمی مجزا مستقیماً پاسخ نده! دامنه‌ات کاملاً قفل به اتومبیل است. در این شرایط با لحن محترمانه خود بگویید:
"کاربر گرامی و دوست عزیز! حوزه تخصصی بنده صرفاً مشاوره فنی خودرو، عیب‌یابی مکانیکی و بررسی برآورد قیمت قطعات یدکی است؛ از پاسخ‌گویی به مباحث متفرقه خارج از این حوزه معذورم. خوشحال می‌شوم سوالات تخصصی درباره خودروی ${carModel} را مجدداً با من مطرح فرمایید." 
سپس بلافاصله بحث را به وضعیت خودروی فعلی "${carModel}" بازگردان.`;

  try {
    let chatReply: string | null = null;

    if (ai) {
      try {
        console.log("Chat Attempt 1: gemini-3.5-flash + search...");
        const chat = ai.chats.create({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: chatInstruction,
            tools: [{ googleSearch: {} }],
          },
        });
        const response = await chat.sendMessage({ message: userMessage });
        chatReply = response.text;
      } catch (chatErr1: any) {
        console.warn("Chat Attempt 1 failed, trying chat Fallback 1: gemini-3.1-flash-lite + search...", chatErr1.message || chatErr1);
        try {
          const chat = ai.chats.create({
            model: "gemini-3.1-flash-lite",
            config: {
              systemInstruction: chatInstruction,
              tools: [{ googleSearch: {} }],
            },
          });
          const response = await chat.sendMessage({ message: userMessage });
          chatReply = response.text;
        } catch (chatErr2: any) {
          console.warn("Chat Attempt 2 failed, trying chat Fallback 2: gemini-3.5-flash WITHOUT search...", chatErr2.message || chatErr2);
          try {
            const chat = ai.chats.create({
              model: "gemini-3.5-flash",
              config: {
                systemInstruction: chatInstruction,
              },
            });
            const response = await chat.sendMessage({ message: userMessage });
            chatReply = response.text;
          } catch (chatErr3: any) {
            console.warn("Chat Attempt 3 failed, trying chat Fallback 3: gemini-3.1-flash-lite WITHOUT search...", chatErr3.message || chatErr3);
            try {
              const chat = ai.chats.create({
                model: "gemini-3.1-flash-lite",
                config: {
                  systemInstruction: chatInstruction,
                },
              });
              const response = await chat.sendMessage({ message: userMessage });
              chatReply = response.text;
            } catch (chatErr4) {
              console.warn("All Gemini chat fallbacks failed.");
            }
          }
        }
      }
    }

    // Try DeepSeek for chat
    if (!chatReply && process.env.DEEPSEEK_API_KEY) {
      try {
        console.log("Attempting DeepSeek chat fallback...");
        const sys = `${chatInstruction}\nپاسخ باید فقط متن گفتگوی دوستانه اوس عماد به زبان فارسی باشد.`;
        const dKey = process.env.DEEPSEEK_API_KEY;
        const url = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";
        const res = await fetch(`${url}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${dKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userMessage }
            ]
          })
        });
        const parsed = await res.json();
        chatReply = parsed?.choices?.[0]?.message?.content || null;
      } catch (e) {
        console.warn("DeepSeek chat fallback failed:", e);
      }
    }

    // Try Ollama for chat
    if (!chatReply) {
      try {
        console.log("Attempting Ollama chat fallback...");
        const url = process.env.OLLAMA_API_URL || "http://localhost:11434";
        const res = await fetch(`${url}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "deepseek-r1",
            messages: [
              { role: "system", content: chatInstruction },
              { role: "user", content: userMessage }
            ],
            stream: false
          })
        });
        const parsed = await res.json();
        chatReply = parsed?.message?.content || null;
      } catch (e) {
        console.warn("Ollama chat fallback failed:", e);
      }
    }

    // Absolute fallback
    if (!chatReply) {
      console.log("Triggering offline conversation replier...");
      chatReply = generateOfflineChatReply(carModel, partName, userMessage);
    }

    return res.json({ reply: chatReply });
  } catch (error: any) {
    console.error("Critical chat error:", error);
    try {
      const defaultReply = generateOfflineChatReply(carModel, partName, userMessage);
      return res.json({ reply: defaultReply });
    } catch (e) {
      return res.status(500).json({
        error: "خطایی در بستر پاسخ‌گویی به گفتگو رخ داد. لطفاً دوباره تلاش کنید.",
      });
    }
  }
});

// Vite middleware configuration for development vs serving built static assets in Production
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
