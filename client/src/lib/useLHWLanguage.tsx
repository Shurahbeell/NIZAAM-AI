import { createContext, useContext, useState, useEffect } from "react";

export type LHWLanguage = "en" | "ur";

interface LHWLanguageContextType {
  language: LHWLanguage;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LHWLanguageContext = createContext<LHWLanguageContextType | undefined>(undefined);

// Comprehensive translations for entire LHW module
const translations: Record<LHWLanguage, Record<string, string>> = {
  en: {
    // Dashboard
    "lhw.dashboard": "LHW Dashboard",
    "lhw.lady_health_worker": "Lady Health Worker",
    "lhw.assigned_households": "Assigned Households",
    "lhw.pending_visits": "Pending Visits",
    "lhw.overdue_vaccinations": "Overdue Vaccinations",
    "lhw.emergency_alerts": "Emergency Alerts",
    "lhw.quick_actions": "Quick Actions",
    "lhw.menstrual_hygiene": "Menstrual Hygiene",
    "lhw.vaccinations": "Vaccinations",
    "lhw.inventory": "Inventory",
    "lhw.education": "Education",
    "lhw.emergencies": "Emergencies",
    "lhw.household_visits": "Household Visits",
    "lhw.donations": "Donations",
    "lhw.back_to_dashboard": "Back to Dashboard",
    "lhw.back": "Back",
    "lhw.logout": "Logout",
    
    // Menstrual Hygiene Hub
    "lhw.menstrual_support": "Menstrual Hygiene Support",
    "lhw.management_module": "LHW Management Module",
    "lhw.households_tracked": "Households Tracked",
    "lhw.using_unsafe_materials": "Using Unsafe Materials",
    "lhw.pending_pad_requests": "Pending Pad Requests",
    "lhw.education_sessions": "Education Sessions",
    "lhw.pads_delivered": "Pads Delivered",
    "lhw.household_profiles": "Household Profiles",
    "lhw.education_sessions_link": "Education Sessions",
    "lhw.pad_distribution": "Pad Distribution",
    "lhw.ai_advisor": "AI Advisor",
    "lhw.pending_requests_alert": "pending pad request(s) need attention",
    "lhw.high_risk_households": "High-Risk Households",
    
    // Menstrual Health Advisor
    "lhw.menstrual_health_advisor": "Menstrual Health Advisor",
    "lhw.ask_question": "Ask your question about menstrual health",
    "lhw.send": "Send",
    "lhw.topic": "Topic",
    "lhw.general": "General",
    "lhw.products": "Products",
    "lhw.hygiene": "Hygiene",
    "lhw.tracking": "Tracking",
    "lhw.infections": "Infections",
    "lhw.adolescent": "Adolescent",
    "lhw.loading": "Loading...",
    
    // Household Profile
    "lhw.household_menstrual_profile": "Household Menstrual Profile",
    "lhw.household_name": "Household Name",
    "lhw.last_cycle_date": "Last Cycle Date",
    "lhw.safe_products": "Uses Safe Products",
    "lhw.notes": "Notes",
    "lhw.update_status": "Update Status",
    "lhw.profile_updated": "Profile updated successfully",
    
    // Pad Distribution
    "lhw.pad_distribution": "Pad Distribution",
    "lhw.quantity_requested": "Quantity Requested",
    "lhw.urgency_level": "Urgency Level",
    "lhw.low": "Low",
    "lhw.medium": "Medium",
    "lhw.high": "High",
    "lhw.submit_request": "Submit Request",
    "lhw.pending": "Pending",
    "lhw.approved": "Approved",
    "lhw.delivered": "Delivered",
    
    // Education Form
    "lhw.education_session": "Education Session",
    "lhw.topics_covered": "Topics Covered",
    "lhw.materials_provided": "Materials Provided",
    "lhw.feedback": "Feedback",
    "lhw.create_session": "Create Session",
    
    // General
    "lhw.phone": "Phone",
    "lhw.address": "Address",
    "lhw.age": "Age",
    "lhw.cnic": "CNIC",
    "lhw.years_old": "years old",
    "lhw.success": "Success",
    "lhw.error": "Error",
    "lhw.cancel": "Cancel",
    "lhw.save": "Save",
    "lhw.delete": "Delete",
    "lhw.edit": "Edit",
    "lhw.view": "View",
    "lhw.add": "Add",
    "lhw.select": "Select",
    "lhw.no_data": "No data available",
  },
  ur: {
    // Dashboard
    "lhw.dashboard": "ایل ایچ ڈبلیو ڈیش بورڈ",
    "lhw.lady_health_worker": "خاتون صحت کارکن",
    "lhw.assigned_households": "تفویض شدہ گھرانے",
    "lhw.pending_visits": "زیر التوا دورے",
    "lhw.overdue_vaccinations": "مقررہ سے زیادہ ویکسینیشن",
    "lhw.emergency_alerts": "ایمرجنسی الرٹس",
    "lhw.quick_actions": "فوری اقدامات",
    "lhw.menstrual_hygiene": "ماہواری کی صفائی",
    "lhw.vaccinations": "ویکسینیشن",
    "lhw.inventory": "انوینٹری",
    "lhw.education": "تعلیم",
    "lhw.emergencies": "ایمرجنسیز",
    "lhw.household_visits": "گھریلو دورے",
    "lhw.donations": "عطیات",
    "lhw.back_to_dashboard": "ڈیش بورڈ پر واپس جائیں",
    "lhw.back": "واپس",
    "lhw.logout": "لاگ آؤٹ",
    
    // Menstrual Hygiene Hub
    "lhw.menstrual_support": "ماہواری کی صفائی کی معاونت",
    "lhw.management_module": "ایل ایچ ڈبلیو مینجمنٹ ماڈیول",
    "lhw.households_tracked": "ٹریک شدہ گھرانے",
    "lhw.using_unsafe_materials": "غیر محفوظ مواد استعمال کرنے والے",
    "lhw.pending_pad_requests": "زیر التوا پیڈ درخواستیں",
    "lhw.education_sessions": "تعلیمی سیشنیں",
    "lhw.pads_delivered": "تقسیم شدہ پیڈز",
    "lhw.household_profiles": "گھریلو پروفائلیں",
    "lhw.education_sessions_link": "تعلیمی سیشنیں",
    "lhw.pad_distribution": "پیڈ کی تقسیم",
    "lhw.ai_advisor": "ای آئی مشیر",
    "lhw.pending_requests_alert": "زیر التوا پیڈ درخواستیں توجہ کی ضرورت ہے",
    "lhw.high_risk_households": "اعلیٰ خطرہ والے گھرانے",
    
    // Menstrual Health Advisor
    "lhw.menstrual_health_advisor": "ماہواری کی صحت کا مشیر",
    "lhw.ask_question": "ماہواری کی صحت کے بارے میں اپنا سوال پوچھیں",
    "lhw.send": "بھیجیں",
    "lhw.topic": "موضوع",
    "lhw.general": "عام",
    "lhw.products": "مصنوعات",
    "lhw.hygiene": "صفائی",
    "lhw.tracking": "ٹریکنگ",
    "lhw.infections": "انفیکشنز",
    "lhw.adolescent": "نوجوان",
    "lhw.loading": "لوڈ ہو رہا ہے...",
    
    // Household Profile
    "lhw.household_menstrual_profile": "گھریلو ماہواری پروفائل",
    "lhw.household_name": "گھرانے کا نام",
    "lhw.last_cycle_date": "آخری سائیکل کی تاریخ",
    "lhw.safe_products": "محفوظ مصنوعات استعمال کرتے ہیں",
    "lhw.notes": "نوٹس",
    "lhw.update_status": "حالت اپڈیٹ کریں",
    "lhw.profile_updated": "پروفائل کامیابی سے اپڈیٹ ہوگیا",
    
    // Pad Distribution
    "lhw.pad_distribution": "پیڈ کی تقسیم",
    "lhw.quantity_requested": "درخواست شدہ مقدار",
    "lhw.urgency_level": "ہنگامیت کی سطح",
    "lhw.low": "کم",
    "lhw.medium": "درمیانہ",
    "lhw.high": "اعلیٰ",
    "lhw.submit_request": "درخواست جمع کریں",
    "lhw.pending": "زیر التوا",
    "lhw.approved": "منظور",
    "lhw.delivered": "تقسیم کیا گیا",
    
    // Education Form
    "lhw.education_session": "تعلیمی سیشن",
    "lhw.topics_covered": "زیر التوا موضوعات",
    "lhw.materials_provided": "فراہم کردہ مواد",
    "lhw.feedback": "رائے",
    "lhw.create_session": "سیشن بنائیں",
    
    // General
    "lhw.phone": "فون",
    "lhw.address": "پتہ",
    "lhw.age": "عمر",
    "lhw.cnic": "سی این آئی سی",
    "lhw.years_old": "سال کی عمر",
    "lhw.success": "کامیاب",
    "lhw.error": "خرابی",
    "lhw.cancel": "منسوخ کریں",
    "lhw.save": "محفوظ کریں",
    "lhw.delete": "حذف کریں",
    "lhw.edit": "ترمیم کریں",
    "lhw.view": "دیکھیں",
    "lhw.add": "شامل کریں",
    "lhw.select": "منتخب کریں",
    "lhw.no_data": "کوئی ڈیٹا دستیاب نہیں",
  },
};

export function LHWLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LHWLanguage>("en");

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("lhw-language") as LHWLanguage | null;
    if (saved && (saved === "en" || saved === "ur")) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ur" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("lhw-language", newLanguage);
    // Set document direction for RTL
    document.documentElement.dir = newLanguage === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LHWLanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LHWLanguageContext.Provider>
  );
}

export function useLHWLanguage(): LHWLanguageContextType {
  const context = useContext(LHWLanguageContext);
  if (!context) {
    throw new Error("useLHWLanguage must be used within LHWLanguageProvider");
  }
  return context;
}
