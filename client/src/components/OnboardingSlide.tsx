import { LucideIcon } from "lucide-react";

interface OnboardingSlideProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function OnboardingSlide({ icon: Icon, title, description }: OnboardingSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Icon className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
      <p className="text-base text-muted-foreground max-w-md leading-relaxed">{description}</p>
    </div>
  );
}
