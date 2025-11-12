import DashboardCard from '../DashboardCard';
import { MessageSquare } from 'lucide-react';

export default function DashboardCardExample() {
  return (
    <DashboardCard
      icon={MessageSquare}
      title="Chat with HealthBot"
      description="AI-powered health assistant"
      onClick={() => console.log('Card clicked')}
    />
  );
}
