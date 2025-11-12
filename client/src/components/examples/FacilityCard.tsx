import FacilityCard from '../FacilityCard';

export default function FacilityCardExample() {
  return (
    <FacilityCard
      name="City General Hospital"
      distance="2.3 km"
      type="Multi-specialty Hospital"
      isOpen={true}
      phone="+1234567890"
      onNavigate={() => console.log('Navigate clicked')}
      onCall={() => console.log('Call clicked')}
      onBook={() => console.log('Book clicked')}
    />
  );
}
