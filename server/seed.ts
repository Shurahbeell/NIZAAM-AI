import { storage } from "./storage";

async function seedDatabase() {
  console.log("Seeding database...");

  const departments = {
    cardiology: "Cardiology",
    general: "General Medicine",
    orthopedics: "Orthopedics",
    pediatrics: "Pediatrics"
  };

  const doctorsData = [
    {
      name: "Dr. Sarah Johnson",
      department: departments.cardiology,
      specialization: "Interventional Cardiology",
      phone: "+92 21 3456789"
    },
    {
      name: "Dr. Michael Chen",
      department: departments.general,
      specialization: "Internal Medicine",
      phone: "+92 21 3456790"
    },
    {
      name: "Dr. Priya Patel",
      department: departments.pediatrics,
      specialization: "Child Healthcare",
      phone: "+92 21 3456791"
    },
    {
      name: "Dr. Ahmed Khan",
      department: departments.orthopedics,
      specialization: "Sports Medicine",
      phone: "+92 21 3456792"
    },
    {
      name: "Dr. Emily Watson",
      department: departments.cardiology,
      specialization: "Cardiac Surgery",
      phone: "+92 21 3456793"
    },
    {
      name: "Dr. Hassan Ali",
      department: departments.general,
      specialization: "Family Medicine",
      phone: "+92 21 3456794"
    }
  ];

  for (const doctorData of doctorsData) {
    const doctor = await storage.createDoctor(doctorData);
    console.log(`Created doctor: ${doctor.name}`);

    const schedules = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDuration: 30 },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDuration: 30 },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDuration: 30 },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDuration: 30 },
      { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", slotDuration: 30 }
    ];

    for (const scheduleData of schedules) {
      await storage.createDoctorSchedule({
        doctorId: doctor.id,
        ...scheduleData
      });
    }
    console.log(`Created schedules for ${doctor.name}`);
  }

  console.log("Database seeding completed!");
}

seedDatabase().catch(console.error);
