import AppointmentCard from '../AppointmentCard';

export default function AppointmentCardExample() {
  return (
    <div className="space-y-4">
      <AppointmentCard
        doctorName="Dr. Sarah Johnson"
        department="Cardiology"
        date="Nov 15, 2025"
        time="2:00 PM"
        status="confirmed"
      />
      <AppointmentCard
        doctorName="Dr. Michael Chen"
        department="General Medicine"
        date="Nov 20, 2025"
        time="10:30 AM"
        status="pending"
      />
    </div>
  );
}
