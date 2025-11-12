import OnboardingSlide from '../OnboardingSlide';
import { Bot } from 'lucide-react';

export default function OnboardingSlideExample() {
  return (
    <OnboardingSlide
      icon={Bot}
      title="AI Health Assistant"
      description="Get instant medical guidance with our intelligent chatbot that helps triage your symptoms"
    />
  );
}
