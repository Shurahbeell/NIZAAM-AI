import MedicalHistoryCard from '../MedicalHistoryCard';

export default function MedicalHistoryCardExample() {
  return (
    <div className="space-y-4">
      <MedicalHistoryCard
        type="appointment"
        title="Cardiology Checkup"
        date="Nov 5, 2025"
        summary="Regular heart health screening"
        details="Blood pressure: 120/80. ECG normal. Doctor recommended continuing current medication."
      />
      <MedicalHistoryCard
        type="emergency"
        title="Emergency Visit"
        date="Oct 20, 2025"
        summary="Minor accident - treated and released"
      />
    </div>
  );
}
