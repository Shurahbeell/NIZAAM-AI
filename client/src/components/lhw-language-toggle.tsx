import { Button } from "@/components/ui/button";
import { useLHWLanguage } from "@/lib/useLHWLanguage";
import { Globe } from "lucide-react";

export function LHWLanguageToggle() {
  const { language, toggleLanguage } = useLHWLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-white hover:bg-white/20 text-xs font-semibold"
      data-testid="button-language-toggle"
      title={language === "en" ? "Switch to Urdu" : "Switch to English"}
    >
      <Globe className="w-4 h-4 mr-1" />
      {language === "en" ? "اردو" : "EN"}
    </Button>
  );
}
