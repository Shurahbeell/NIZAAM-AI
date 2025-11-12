import EmergencyButton from '../EmergencyButton';

export default function EmergencyButtonExample() {
  return (
    <div className="relative h-40">
      <EmergencyButton onClick={() => console.log('Emergency activated')} />
    </div>
  );
}
