import { useState } from "react";
import { Button } from "@/components/ui/button";
import OnboardingSlide from "@/components/OnboardingSlide";
import { Bot, AlertTriangle, Calendar, ClipboardList } from "lucide-react";
import { useLocation } from "wouter";

const slides = [
  {
    icon: Bot,
    title: "AI Health Assistant",
    description: "Get instant medical guidance with our intelligent chatbot that helps triage your symptoms"
  },
  {
    icon: AlertTriangle,
    title: "Emergency Assistance",
    description: "One-tap emergency alerts with auto-filled information and GPS location sent to nearby facilities"
  },
  {
    icon: Calendar,
    title: "Easy Appointments",
    description: "Book appointments with specialists quickly and track all your upcoming visits in one place"
  },
  {
    icon: ClipboardList,
    title: "Medical History",
    description: "Access your complete health records, prescriptions, and medical history anytime, anywhere"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setLocation("/login");
    }
  };

  const handleSkip = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-end p-4 pr-24">
        <Button variant="ghost" onClick={handleSkip} data-testid="button-skip">
          Skip
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <OnboardingSlide {...slides[currentSlide]} />
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
        
        <Button
          size="lg"
          className="w-full"
          onClick={handleNext}
          data-testid="button-next"
        >
          {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
