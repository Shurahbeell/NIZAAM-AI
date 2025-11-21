import { useLanguage } from "@/lib/useLanguage";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        data-testid="button-lang-en"
        className="min-w-[80px]"
      >
        English
      </Button>
      <Button
        variant={language === 'ur' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('ur')}
        data-testid="button-lang-ur"
        className="min-w-[80px]"
      >
        اردو
      </Button>
      <Button
        variant={language === 'ru' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('ru')}
        data-testid="button-lang-ru"
        className="min-w-[80px]"
      >
        Urdu
      </Button>
    </div>
  );
}
