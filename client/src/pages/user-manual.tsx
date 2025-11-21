import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";

interface ManualSection {
  id: string;
  titleEn: string;
  titleUr: string;
  contentEn: string[];
  contentUr: string[];
}

interface FAQItem {
  id: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
}

const manualSections: ManualSection[] = [
  {
    id: "overview",
    titleEn: "Overview of the App",
    titleUr: "ایپ کا مختصر تعارف",
    contentEn: [
      "This health app helps you take care of your health with AI-powered support from anywhere in Pakistan.",
      "Key features include:",
      "• Symptom checking with AI guidance (Triage)",
      "• Check eligibility for government health programs",
      "• Find hospitals and health centers near you",
      "• Book and manage appointments",
      "• Track vaccinations and health records",
      "• Access women's and child health information",
      "• Emergency assistance with real-time location sharing",
      "• Works offline with cached medical information"
    ],
    contentUr: [
      "یہ ہیلتھ ایپ آپ کو پاکستان میں کسی بھی جگہ سے AI کی مدد سے اپنی صحت کی دیکھ بھال کرنے میں مدد دیتی ہے۔",
      "اہم خصوصیات:",
      "• علامات کی جانچ AI کی رہنمائی کے ساتھ (Triage)",
      "• سرکاری صحت کے پروگراموں کے لیے اہلیت کی جانچ",
      "• آپ کے قریب ہسپتالیں اور صحت کے مراکز تلاش کریں",
      "• ملاقات بک کریں اور منیج کریں",
      "• ویکسین اور صحت کے ریکارڈ کو ٹریک کریں",
      "• خواتین اور بچوں کی صحت کی معلومات حاصل کریں",
      "• ریئل ٹائم لوکیشن شیئرنگ کے ساتھ ایمرجنسی مدد",
      "• آف لائن کام کرتا ہے کیش شدہ میڈیکل معلومات کے ساتھ"
    ]
  },
  {
    id: "symptoms",
    titleEn: "How to Enter Symptoms",
    titleUr: "علامات درج کرنے کا طریقہ",
    contentEn: [
      "Follow these simple steps:",
      "1. Tap on 'Symptom Checker' from the home screen",
      "2. Describe your main symptom (fever, cough, pain, etc.)",
      "3. Answer follow-up questions about:",
      "   - Duration (how long you've had the symptom)",
      "   - Severity (mild, moderate, severe)",
      "   - Associated symptoms (what else you're feeling)",
      "   - Your age and health history",
      "4. Be honest with your answers for best results",
      "5. You can add multiple symptoms at once",
      "6. Tap 'Check' to get AI analysis"
    ],
    contentUr: [
      "یہ سادہ اقدامات کریں:",
      "1. ہوم اسکرین سے 'علامات کی جانچ' پر ٹیپ کریں",
      "2. اپنی بنیادی علامت بیان کریں (بخار، کھانسی، درد، وغیرہ)",
      "3. اضافی سوالات کے جوابات دیں:",
      "   - مدت (آپ کو علامت کتنی دیر ہے)",
      "   - شدت (ہلکا، درمیانہ، شدید)",
      "   - دیگر علامات (آپ اور کیا محسوس کر رہے ہیں)",
      "   - آپ کی عمر اور صحت کی تاریخ",
      "4. بہترین نتائج کے لیے اپنے جوابات میں ایمانداری سے کام لیں",
      "5. آپ ایک ساتھ متعدد علامات شامل کر سکتے ہیں",
      "6. AI تجزیہ حاصل کرنے کے لیے 'چیک کریں' پر ٹیپ کریں"
    ]
  },
  {
    id: "triage",
    titleEn: "How Triage Works",
    titleUr: "ٹریج کیسے کام کرتا ہے",
    contentEn: [
      "Triage means sorting patients by urgency. Our AI does this in seconds:",
      "The system analyzes your symptoms and provides:",
      "• URGENT: Go to hospital immediately (possible emergency)",
      "• HIGH: Visit hospital today (serious condition)",
      "• MEDIUM: Can wait 1-2 days (moderate concern)",
      "• LOW: Home care or routine checkup (minor issue)",
      "• INFORMATION ONLY: Just educational (no action needed)",
      "Each assessment includes:",
      "• Possible conditions you might have",
      "• What to watch for",
      "• When to seek help",
      "• Suggested next steps",
      "Important: This is NOT a doctor's diagnosis. Always consult a real doctor for confirmation."
    ],
    contentUr: [
      "ٹریج کا مطلب ہے مریضوں کو فوری ضرورت کی بنیاد پر ترتیب دینا۔ ہماری AI یہ سیکنڈ میں کرتی ہے:",
      "سسٹم آپ کی علامات کا تجزیہ کرتا ہے اور فراہم کرتا ہے:",
      "• فوری: فوری طور پر ہسپتال جائیں (ممکنہ ایمرجنسی)",
      "• زیادہ: آج ہسپتال جائیں (سنجیدہ حالت)",
      "• درمیانہ: 1-2 دن انتظار کر سکتے ہیں (اعتدال پسند تشویش)",
      "• کم: گھریلو دیکھ بھال یا معمولی چیک اپ (معمولی مسئلہ)",
      "• صرف معلومات: تعلیمی ہی (کوئی کارروائی نہیں)",
      "ہر تشخیص میں شامل ہے:",
      "• ممکنہ حالات جو آپ کے پاس ہو سکتے ہیں",
      "• کیا دیکھنا ہے",
      "• کب مدد لینی ہے",
      "• تجویز کردہ اگلے اقدامات",
      "اہم: یہ ڈاکٹر کی تشخیص نہیں ہے۔ تصدیق کے لیے ہمیشہ اصل ڈاکٹر سے ملیں۔"
    ]
  },
  {
    id: "eligibility",
    titleEn: "How Eligibility for Programs is Checked",
    titleUr: "پروگراموں کے لیے اہلیت کی جانچ کیسے ہوتی ہے",
    contentEn: [
      "Pakistan has free health programs you might qualify for:",
      "To check your eligibility:",
      "1. Go to 'Health Programs' section",
      "2. Choose 'Check Eligibility'",
      "3. Answer questions about:",
      "   - Your age",
      "   - Income level",
      "   - Health conditions",
      "   - Job status (student, employee, retired, etc.)",
      "   - Location in Pakistan",
      "4. The AI will tell you which programs you qualify for",
      "Programs include:",
      "• Sehat Insaf Card (free treatment up to PKR 500,000)",
      "• EPI (free vaccinations)",
      "• BISP (cash assistance if eligible)",
      "• Maternal health programs",
      "• TB and hepatitis treatment",
      "• You'll see program details, how to apply, and required documents"
    ],
    contentUr: [
      "پاکستان میں مفت صحت کے پروگرام ہیں جن کے لیے آپ اہل ہو سکتے ہیں:",
      "اپنی اہلیت کی جانچ کرنے کے لیے:",
      "1. 'صحت کے پروگرام' سیکشن میں جائیں",
      "2. 'اہلیت کی جانچ' منتخب کریں",
      "3. اس بارے میں سوالات کے جوابات دیں:",
      "   - آپ کی عمر",
      "   - آمدنی کی سطح",
      "   - صحت کی حالات",
      "   - کام کی حیثیت (طالب علم، ملازم، ریٹائرڈ، وغیرہ)",
      "   - پاکستان میں مقام",
      "4. AI آپ کو بتائے گی کہ آپ کون سے پروگراموں کے لیے اہل ہیں",
      "پروگرام میں شامل ہیں:",
      "• سیحت انصاف کارڈ (50 لاکھ روپے تک مفت علاج)",
      "• EPI (مفت ویکسین)",
      "• BISP (اگر اہل ہوں تو نقد امداد)",
      "• مادریت کی صحت کے پروگرام",
      "• TB اور ہیپاٹائٹس کا علاج",
      "• آپ کو پروگرام کی تفصیلات، درخواست دیں گے اور ضروری دستاویزات نظر آئیں گی"
    ]
  },
  {
    id: "facility",
    titleEn: "How to Find a Facility",
    titleUr: "سہولت تلاش کرنے کا طریقہ",
    contentEn: [
      "Find the nearest hospital or health center:",
      "1. Tap 'Find Hospital/Clinic' from the home screen",
      "2. The app will ask for location permission",
      "3. Allow location access for accurate results",
      "The app will show:",
      "• Nearest facilities within 5-50 km",
      "• Hospital name and distance",
      "• Contact phone number",
      "• Services available",
      "• Emergency services (if available)",
      "4. Tap a facility to see more details",
      "5. You can call directly or get directions",
      "Tips:",
      "• Allow GPS for most accurate results",
      "• Works offline with cached facility data",
      "• Can search by facility type (hospital, clinic, BHU)",
      "• Check if facility accepts your health program card"
    ],
    contentUr: [
      "قریب ترین ہسپتال یا صحت کے مراکز کو تلاش کریں:",
      "1. ہوم اسکرین سے 'ہسپتال/کلینک تلاش کریں' پر ٹیپ کریں",
      "2. ایپ مقام کی اجازت مانگے گی",
      "3. درست نتائج کے لیے مقام کی رسائی کی اجازت دیں",
      "ایپ یہ دکھائے گی:",
      "• 5-50 کلومیٹر کے اندر قریب ترین سہولیات",
      "• ہسپتال کا نام اور فاصلہ",
      "• رابطہ فون نمبر",
      "• دستیاب خدمات",
      "• ایمرجنسی سروسز (اگر دستیاب ہو)",
      "4. مزید تفصیلات دیکھنے کے لیے کسی سہولت پر ٹیپ کریں",
      "5. آپ براہ راست کال کر سکتے ہیں یا سمت حاصل کر سکتے ہیں",
      "نکات:",
      "• سب سے درست نتائج کے لیے GPS کی اجازت دیں",
      "• کیش شدہ سہولت کے ڈیٹا کے ساتھ آف لائن کام کرتا ہے",
      "• سہولت کی قسم سے تلاش کر سکتے ہیں (ہسپتال، کلینک، BHU)",
      "• چیک کریں کہ سہولت آپ کے صحت کے پروگرام کارڈ کو قبول کرتا ہے"
    ]
  },
  {
    id: "followup",
    titleEn: "How Follow-ups and Reminders Work",
    titleUr: "فالو اپ اور یادوں کیسے کام کرتے ہیں",
    contentEn: [
      "The app helps you remember important health tasks:",
      "Reminders are sent for:",
      "• Vaccination schedules (EPI vaccines)",
      "• Medication times (when prescribed)",
      "• Appointment confirmations",
      "• Follow-up medical visits",
      "• Lab test results",
      "• Screening appointments",
      "How to set reminders:",
      "1. Go to your Medical Profile",
      "2. Add medicines with times",
      "3. Add vaccinations you need",
      "4. Add future appointments",
      "5. The app will notify you at the right time",
      "You can:",
      "• Turn reminders on/off",
      "• Change reminder times",
      "• Mark tasks as done",
      "• View reminder history",
      "Note: Reminders work best when app is installed on your phone"
    ],
    contentUr: [
      "ایپ آپ کو اہم صحت کے کام یاد رکھنے میں مدد دیتی ہے:",
      "یہ یادیں بھیجی جاتی ہیں:",
      "• ویکسین کے شیڈول (EPI ویکسین)",
      "• دوائیں کے اوقات (جب تجویز کی گئی ہو)",
      "• ملاقات کی تصدیق",
      "• فالو اپ میڈیکل ملاقاتیں",
      "• لیب ٹیسٹ کے نتائج",
      "• اسکریننگ کی تقریریں",
      "یادوں کو کیسے سیٹ کریں:",
      "1. اپنی میڈیکل پروفائل میں جائیں",
      "2. اوقات کے ساتھ دوائیں شامل کریں",
      "3. ویکسین شامل کریں جن کی ضرورت ہے",
      "4. مستقبل کی ملاقاتیں شامل کریں",
      "5. ایپ آپ کو صحیح وقت پر مطلع کرے گی",
      "آپ کر سکتے ہیں:",
      "• یادوں کو آن/آف کریں",
      "• یادوں کے اوقات تبدیل کریں",
      "• کام کو مکمل کے طور پر نشان زد کریں",
      "• یاد کی تاریخ دیکھیں",
      "نوٹ: جب ایپ آپ کے فون پر انسٹال ہو تو یادیں سب سے بہتر کام کرتی ہیں"
    ]
  },
  {
    id: "offline",
    titleEn: "Offline / Degraded Mode Explanation",
    titleUr: "آف لائن / کم تر موڈ کی وضاحت",
    contentEn: [
      "The app works without internet using 'Offline Mode':",
      "What works offline:",
      "• View previously saved health records",
      "• Check cached vaccination schedules",
      "• Read medicine information",
      "• View diseases and symptoms library",
      "• See emergency contacts",
      "• Review stored medical history",
      "What needs internet:",
      "• AI triage (symptom checking)",
      "• Booking new appointments",
      "• Checking program eligibility",
      "• Finding nearby facilities (uses GPS)",
      "• Contacting support",
      "How to prepare for offline use:",
      "1. Download all content while online",
      "2. Save important medical records",
      "3. Keep emergency contacts stored",
      "4. Download facility list for your area",
      "5. The app automatically caches information",
      "Note: Emergency services (SOS) require active internet connection"
    ],
    contentUr: [
      "ایپ انٹرنیٹ کے بغیر 'آف لائن موڈ' استعمال کرتے ہوئے کام کرتی ہے:",
      "آف لائن کیا کام کرتا ہے:",
      "• پہلے سے محفوظ صحت کے ریکارڈ دیکھیں",
      "• کیش شدہ ویکسین کے شیڈول چیک کریں",
      "• دوائی کی معلومات پڑھیں",
      "• بیماری اور علامات کی لائبریری دیکھیں",
      "• ایمرجنسی رابطے دیکھیں",
      "• ذخیرہ شدہ میڈیکل تاریخ کا جائزہ لیں",
      "انٹرنیٹ کی ضرورت ہے:",
      "• AI ٹریج (علامات کی جانچ)",
      "• نئی ملاقاتوں کو بک کرنا",
      "• پروگرام کی اہلیت کی جانچ کرنا",
      "• قریبی سہولیات تلاش کرنا (GPS استعمال کرتا ہے)",
      "• سپورٹ سے رابطہ کرنا",
      "آف لائن استعمال کے لیے کیسے تیاری کریں:",
      "1. آن لائن ہوتے ہوئے تمام مواد ڈاؤن لوڈ کریں",
      "2. اہم میڈیکل ریکارڈ محفوظ کریں",
      "3. ایمرجنسی رابطوں کو ذخیرہ رکھیں",
      "4. اپنے علاقے کے لیے سہولت کی فہرست ڈاؤن لوڈ کریں",
      "5. ایپ خودکار طور پر معلومات کو کیش کرتی ہے",
      "نوٹ: ایمرجنسی سروسز (SOS) کو فعال انٹرنیٹ کنکشن درکار ہے"
    ]
  },
  {
    id: "privacy",
    titleEn: "Privacy and Data Usage",
    titleUr: "رازداری اور ڈیٹا کا استعمال",
    contentEn: [
      "Your health data is protected:",
      "What data we collect:",
      "• Your name, age, and location",
      "• Medical history and symptoms",
      "• Appointments and prescriptions",
      "• Vaccination records",
      "• Emergency contact information",
      "How we use your data:",
      "• To provide you with health recommendations",
      "• To show nearby hospitals and facilities",
      "• To send appointment reminders",
      "• To improve the app (anonymously)",
      "• To comply with Pakistan health regulations",
      "What we do NOT do:",
      "• Sell your data to anyone",
      "• Share with third parties without permission",
      "• Use for marketing or advertising",
      "• Store passwords or financial data",
      "Your privacy rights:",
      "• Access your own data anytime",
      "• Request data deletion (except legal records)",
      "• Control what data is shared",
      "• Report privacy concerns to support",
      "Encryption: All data is encrypted in transit and at rest"
    ],
    contentUr: [
      "آپ کا صحت کا ڈیٹا محفوظ ہے:",
      "ہم کیا ڈیٹا جمع کرتے ہیں:",
      "• آپ کا نام، عمر، اور مقام",
      "• میڈیکل تاریخ اور علامات",
      "• ملاقاتیں اور نسخے",
      "• ویکسین کے ریکارڈ",
      "• ایمرجنسی رابطہ کی معلومات",
      "ہم آپ کے ڈیٹا کو کیسے استعمال کرتے ہیں:",
      "• آپ کو صحت کی سفارشات فراہم کرنے کے لیے",
      "• قریبی ہسپتالیں اور سہولیات دکھانے کے لیے",
      "• ملاقات کی یادیں بھیجنے کے لیے",
      "• ایپ کو بہتر بنانے کے لیے (گمنام طور پر)",
      "• پاکستان کے صحت کے اصول کی تابعداری کے لیے",
      "ہم کیا نہیں کرتے:",
      "• آپ کے ڈیٹا کو کسی کو فروخت نہ کریں",
      "• بغیر اجازت تیسری پارٹی کے ساتھ شیئر کریں",
      "• مارکیٹنگ یا اشتہارات کے لیے استعمال کریں",
      "• پاس ورڈ یا مالیاتی ڈیٹا محفوظ کریں",
      "آپ کے رازداری کے حقوق:",
      "• کسی بھی وقت اپنا ڈیٹا حاصل کریں",
      "• ڈیٹا ڈیلیشن کی درخواست کریں (قانونی ریکارڈ کے علاوہ)",
      "• کنٹرول کریں کہ کون سا ڈیٹا شیئر ہے",
      "• سپورٹ کو رازداری کی تشویشوں کی اطلاع دیں",
      "انکرپشن: تمام ڈیٹا منتقلی اور باقی میں انکرپٹ ہے"
    ]
  }
];

const faqItems: FAQItem[] = [
  {
    id: "faq1",
    questionEn: "Is my health data safe?",
    questionUr: "کیا میرا صحت کا ڈیٹا محفوظ ہے؟",
    answerEn: "Yes. All data is encrypted and stored securely. We follow Pakistan's health data protection guidelines and never sell your information.",
    answerUr: "ہاں۔ تمام ڈیٹا منکشف ہے اور محفوظ طریقے سے ذخیرہ ہے۔ ہم پاکستان کے صحت کے ڈیٹا تحفظ کے رہنما اصول پر عمل کرتے ہیں اور کبھی آپ کی معلومات فروخت نہیں کرتے۔"
  },
  {
    id: "faq2",
    questionEn: "Can I use this without internet?",
    questionUr: "کیا میں انٹرنیٹ کے بغیر یہ استعمال کر سکتا ہوں؟",
    answerEn: "Partially. You can view saved records, medicines, and facilities offline. AI features and appointment booking need internet.",
    answerUr: "جزوی طور پر۔ آپ آف لائن محفوظ ریکارڈ، دوائیں، اور سہولیات دیکھ سکتے ہیں۔ AI کی خصوصیات اور ملاقات کی بکنگ کے لیے انٹرنیٹ درکار ہے۔"
  },
  {
    id: "faq3",
    questionEn: "Is the AI doctor diagnosis accurate?",
    questionUr: "کیا AI ڈاکٹر کی تشخیص درست ہے؟",
    answerEn: "The AI provides guidance, not medical diagnosis. Always consult a real doctor for confirmation and treatment.",
    answerUr: "AI رہنمائی فراہم کرتا ہے، میڈیکل تشخیص نہیں۔ تصدیق اور علاج کے لیے ہمیشہ اصل ڈاکٹر سے ملیں۔"
  },
  {
    id: "faq4",
    questionEn: "How do I find which health programs I qualify for?",
    questionUr: "میں کون سے صحت کے پروگراموں کے لیے اہل ہوں یہ کیسے معلوم کر سکتا ہوں؟",
    answerEn: "Go to Health Programs > Check Eligibility. Answer questions about your age, income, and health. The app will show programs you qualify for.",
    answerUr: "صحت کے پروگرام > اہلیت کی جانچ میں جائیں۔ اپنی عمر، آمدنی، اور صحت کے بارے میں سوالات کے جوابات دیں۔ ایپ آپ کو اہل پروگرام دکھائے گی۔"
  },
  {
    id: "faq5",
    questionEn: "What should I do in a real emergency?",
    questionUr: "اصل ایمرجنسی میں مجھے کیا کرنا چاہیے؟",
    answerEn: "Call 1122 (Rescue service in Pakistan) immediately. The app's emergency feature helps but cannot replace emergency calls.",
    answerUr: "فوری طور پر 1122 (پاکستان میں ریسکیو سروس) کو کال کریں۔ ایپ کی ایمرجنسی خصوصیت مدد کرتی ہے لیکن ایمرجنسی کالوں کی جگہ نہیں لے سکتی۔"
  },
  {
    id: "faq6",
    questionEn: "How often should I update my health profile?",
    questionUr: "مجھے اپنی صحت کی پروفائل کتنی بار اپڈیٹ کرنی چاہیے؟",
    answerEn: "Update whenever there's a change: new medicines, new conditions, or after doctor visits. This ensures accurate recommendations.",
    answerUr: "جب کوئی تبدیلی ہو تو اپڈیٹ کریں: نئی دوائیں، نئی حالات، یا ڈاکٹر کی ملاقات کے بعد۔ یہ درست سفارشات یقینی بناتا ہے۔"
  }
];

export default function UserManual() {
  const { language, setLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const isUrdu = language === "ur" || language === "ru";

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return manualSections;

    const term = searchTerm.toLowerCase();
    return manualSections.filter(section => {
      const title = isUrdu ? section.titleUr : section.titleEn;
      const content = isUrdu ? section.contentUr.join(" ") : section.contentEn.join(" ");
      return title.toLowerCase().includes(term) || content.toLowerCase().includes(term);
    });
  }, [searchTerm, isUrdu]);

  const filteredFAQ = useMemo(() => {
    if (!searchTerm.trim()) return faqItems;

    const term = searchTerm.toLowerCase();
    return faqItems.filter(item => {
      const question = isUrdu ? item.questionUr : item.questionEn;
      const answer = isUrdu ? item.answerUr : item.answerEn;
      return question.toLowerCase().includes(term) || answer.toLowerCase().includes(term);
    });
  }, [searchTerm, isUrdu]);

  return (
    <div className="min-h-screen bg-background" dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{isUrdu ? "صارف دستور العمل" : "User Manual"}</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(isUrdu ? "en" : "ur")}
              data-testid="button-language-toggle"
            >
              {isUrdu ? "English" : "اردو"}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={isUrdu ? "تلاش کریں..." : "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isUrdu ? "pr-10" : "pl-10"}
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Manual Sections */}
        {filteredSections.map((section) => (
          <Card key={section.id} className="p-6" data-testid={`section-${section.id}`}>
            <h2 className="text-xl font-bold mb-4">
              {isUrdu ? section.titleUr : section.titleEn}
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-secondary">
              {(isUrdu ? section.contentUr : section.contentEn).map((line, idx) => (
                <p key={idx} className={line.startsWith("•") || line.startsWith("   -") ? "ml-4" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </Card>
        ))}

        {/* FAQ Section */}
        {filteredFAQ.length > 0 && (
          <Card className="p-6" data-testid="section-faq">
            <h2 className="text-xl font-bold mb-4">
              {isUrdu ? "اکثر پوچھے جانے والے سوالات" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-3">
              {filteredFAQ.map((item) => (
                <div key={item.id} className="border rounded-md" data-testid={`faq-item-${item.id}`}>
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors text-left"
                    data-testid={`button-faq-${item.id}`}
                  >
                    <span className="font-medium">
                      {isUrdu ? item.questionUr : item.questionEn}
                    </span>
                    {expandedFAQ === item.id ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === item.id && (
                    <div className="px-4 py-3 bg-muted text-sm border-t">
                      {isUrdu ? item.answerUr : item.answerEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* No Results */}
        {filteredSections.length === 0 && filteredFAQ.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            <p>
              {isUrdu ? "کوئی نتیجہ نہیں ملا" : "No results found"}
            </p>
          </Card>
        )}
      </div>

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  );
}
