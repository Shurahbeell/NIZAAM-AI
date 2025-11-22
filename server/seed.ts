import { db } from "./db";
import { users, hospitals, doctors, frontliners, appointments, medicalHistory, medicines } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing test data
    console.log("🧹 Clearing existing data...");
    await db.delete(medicines);
    await db.delete(medicalHistory);
    await db.delete(appointments);
    await db.delete(frontliners);
    await db.delete(doctors);
    await db.delete(users).where(eq(users.role, 'patient')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'hospital')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'frontliner')).catch(() => {});
    await db.delete(hospitals);

    // 1. Create Hospital with details
    console.log("🏥 Creating hospital...");
    const hospital = await db
      .insert(hospitals)
      .values({
        name: "Jinnah Hospital Lahore",
        address: "Railway Road, Lahore",
        phone: "+92-42-99203000",
        email: "info@jinnah.gov.pk",
        type: "government",
        facilities: ["Emergency", "ICU", "Lab", "Radiology", "Cardiology", "Endocrinology"],
        latitude: "31.5497",
        longitude: "74.3436",
      })
      .returning();

    console.log("✅ Hospital created:", hospital[0].id);

    // 2. Create Hospital Staff User
    console.log("👨‍⚕️ Creating hospital staff user...");
    const hospitalPassword = await bcrypt.hash("HospitalStaff123!", SALT_ROUNDS);
    const hospitalUser = await db
      .insert(users)
      .values({
        username: "hospital_staff_1",
        password: hospitalPassword,
        role: "hospital",
        hospitalId: hospital[0].id,
        fullName: "Dr. Ahmed Hassan",
        phone: "+92-321-1234567",
        age: 45,
      })
      .returning();

    console.log("✅ Hospital staff created:", hospitalUser[0].id);

    // 3. Create Doctors
    console.log("👨‍⚕️ Creating doctors...");
    const doctor1 = await db
      .insert(doctors)
      .values({
        hospitalId: hospital[0].id,
        name: "Dr. Sarah Johnson",
        specialization: "General Medicine",
        qualification: "MBBS, MD",
        consultationFee: 1500,
        availability: '{"Monday":"09:00-17:00","Tuesday":"09:00-17:00","Wednesday":"09:00-17:00","Thursday":"09:00-17:00","Friday":"09:00-17:00"}',
        isAvailable: true,
      })
      .returning();

    console.log("✅ Doctors created");

    // 4. Create Patient User (Diabetic)
    console.log("👤 Creating patient user...");
    const patientPassword = await bcrypt.hash("Patient123!", SALT_ROUNDS);
    const patient = await db
      .insert(users)
      .values({
        username: "ali_diabetes_patient",
        password: patientPassword,
        role: "patient",
        fullName: "Ali Ahmed Khan",
        phone: "+92-300-9876543",
        cnic: "12345-6789012-3",
        address: "123 Main Street, Lahore",
        age: 48,
        bloodGroup: "O+",
        emergencyContact: "+92-300-1234567",
      })
      .returning();

    console.log("✅ Patient created:", patient[0].id);

    // 5. Add Medical History - Diabetes
    console.log("📋 Adding medical history...");
    await db.insert(medicalHistory).values({
      userId: patient[0].id,
      condition: "Type 2 Diabetes Mellitus",
      diagnosisDate: new Date("2020-05-15"),
      status: "active",
      notes: "Diagnosed 4 years ago. Managed with diet and medication.",
    });

    await db.insert(medicalHistory).values({
      userId: patient[0].id,
      condition: "Hypertension",
      diagnosisDate: new Date("2021-03-20"),
      status: "active",
      notes: "Blood pressure controlled with medication.",
    });

    console.log("✅ Medical history added");

    // 6. Add Medicines
    console.log("💊 Adding medicines...");
    await db.insert(medicines).values([
      {
        userId: patient[0].id,
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        reason: "Diabetes management",
        startDate: new Date("2020-05-15"),
        isActive: true,
        sideEffects: "Mild nausea in first week",
      },
      {
        userId: patient[0].id,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        reason: "Blood pressure control",
        startDate: new Date("2021-03-20"),
        isActive: true,
        sideEffects: "None reported",
      },
      {
        userId: patient[0].id,
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily at night",
        reason: "Cholesterol management",
        startDate: new Date("2021-06-01"),
        isActive: true,
        sideEffects: "Occasional muscle pain",
      },
    ]);

    console.log("✅ Medicines added");

    // 7. Create Frontliner User (Rescue 1122)
    console.log("🚑 Creating frontliner user...");
    const frontlinerPassword = await bcrypt.hash("Frontliner123!", SALT_ROUNDS);
    const frontlinerUser = await db
      .insert(users)
      .values({
        username: "rescue_1122_worker",
        password: frontlinerPassword,
        role: "frontliner",
        fullName: "Muhammad Wasim",
        phone: "+92-300-5555555",
        cnic: "98765-4321098-7",
        address: "Rescue 1122 Station, Lahore",
        age: 35,
      })
      .returning();

    console.log("✅ Frontliner created:", frontlinerUser[0].id);

    // 8. Create Frontliner Profile
    console.log("🚑 Creating frontliner profile...");
    await db.insert(frontliners).values({
      userId: frontlinerUser[0].id,
      vehicleType: "Ambulance",
      isAvailable: true,
      currentLat: "31.5497",
      currentLng: "74.3436",
      lastSeenAt: new Date(),
      organization: "Rescue 1122",
    });

    console.log("✅ Frontliner profile created");

    // 9. Create a test appointment (patient booked)
    console.log("📅 Creating test appointment...");
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7); // Next week
    appointmentDate.setHours(14, 0, 0, 0);

    await db.insert(appointments).values({
      patientId: patient[0].id,
      hospitalId: hospital[0].id,
      doctorId: doctor1[0].id,
      appointmentDate: appointmentDate,
      status: "pending",
      patientName: patient[0].fullName || "Ali Ahmed Khan",
      patientPhone: patient[0].phone || "+92-300-9876543",
      symptoms: "Diabetes follow-up and blood sugar check",
      notes: "Regular checkup for diabetes management",
    });

    console.log("✅ Test appointment created");

    console.log("\n✅ Database seed completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("  Patient: ali_diabetes_patient / Patient123!");
    console.log("  Hospital: hospital_staff_1 / HospitalStaff123!");
    console.log("  Frontliner: rescue_1122_worker / Frontliner123!");
    console.log("\n🔑 Hospital ID:", hospital[0].id);
    console.log("👤 Patient ID:", patient[0].id);
    console.log("🚑 Frontliner User ID:", frontlinerUser[0].id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
