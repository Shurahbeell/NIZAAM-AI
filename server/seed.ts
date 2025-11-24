import { db } from "./db";
import { 
  users, hospitals, doctors, frontliners, appointments, medicalHistory, medicines,
  lhwAssignments, menstrualHygieneStatus, menstrualPadRequests, menstrualEducationSessions 
} from "@shared/schema";
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
    await db.delete(menstrualEducationSessions).catch(() => {});
    await db.delete(menstrualPadRequests).catch(() => {});
    await db.delete(menstrualHygieneStatus).catch(() => {});
    await db.delete(lhwAssignments).catch(() => {});
    await db.delete(frontliners);
    await db.delete(doctors);
    await db.delete(users).where(eq(users.role, 'patient')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'hospital')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'frontliner')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'lhw')).catch(() => {});
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
    const doctorsCreated = await db
      .insert(doctors)
      .values([
        {
          hospitalId: hospital[0].id,
          name: "Dr. Sarah Johnson",
          specialization: "General Medicine",
          qualification: "MBBS, MD",
          consultationFee: 1500,
          availability: '{"Monday":"09:00-17:00","Tuesday":"09:00-17:00","Wednesday":"09:00-17:00","Thursday":"09:00-17:00","Friday":"09:00-17:00"}',
          isAvailable: true,
        },
        {
          hospitalId: hospital[0].id,
          name: "Dr. Michael Chen",
          specialization: "Cardiology",
          qualification: "MBBS, MD (Cardiology)",
          consultationFee: 2500,
          availability: '{"Monday":"10:00-16:00","Tuesday":"10:00-16:00","Wednesday":"10:00-16:00","Thursday":"10:00-16:00","Friday":"10:00-16:00"}',
          isAvailable: true,
        },
        {
          hospitalId: hospital[0].id,
          name: "Dr. Priya Patel",
          specialization: "Orthopedics",
          qualification: "MBBS, MS (Orthopedics)",
          consultationFee: 2000,
          availability: '{"Monday":"08:00-15:00","Tuesday":"08:00-15:00","Wednesday":"08:00-15:00","Thursday":"08:00-15:00","Friday":"08:00-15:00"}',
          isAvailable: true,
        },
        {
          hospitalId: hospital[0].id,
          name: "Dr. Fatima Khan",
          specialization: "Pediatrics",
          qualification: "MBBS, DCH (Pediatrics)",
          consultationFee: 1800,
          availability: '{"Monday":"09:00-17:00","Tuesday":"09:00-17:00","Wednesday":"09:00-17:00","Thursday":"09:00-17:00","Friday":"09:00-17:00"}',
          isAvailable: true,
        },
        {
          hospitalId: hospital[0].id,
          name: "Dr. Ahmad Malik",
          specialization: "Dermatology",
          qualification: "MBBS, MD (Dermatology)",
          consultationFee: 1600,
          availability: '{"Monday":"11:00-18:00","Tuesday":"11:00-18:00","Wednesday":"11:00-18:00","Thursday":"11:00-18:00","Friday":"11:00-18:00"}',
          isAvailable: true,
        },
      ])
      .returning();

    console.log("✅ 5 Doctors created");

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

    // 8.5. Create LHW User (Lady Health Worker)
    console.log("👩‍⚕️ Creating LHW user...");
    const lhwPassword = await bcrypt.hash("LHW123!", SALT_ROUNDS);
    const lhwUser = await db
      .insert(users)
      .values({
        username: "lhw_test",
        password: lhwPassword,
        role: "lhw",
        fullName: "Fatima Bibi",
        phone: "+92-300-7777777",
        cnic: "54321-0987654-3",
        address: "LHW Center, Lahore",
        age: 32,
      })
      .returning();

    console.log("✅ LHW created:", lhwUser[0].id);

    // 9. Create LHW Assignments (Households)
    console.log("🏘️  Creating LHW household assignments...");
    const assignments = await db
      .insert(lhwAssignments)
      .values([
        {
          lhwId: lhwUser[0].id,
          householdId: "HH-001",
          householdName: "Ahmed Family",
          latitude: "31.5497",
          longitude: "74.3436",
          populationServed: 5,
        },
        {
          lhwId: lhwUser[0].id,
          householdId: "HH-002",
          householdName: "Khan Residence",
          latitude: "31.5500",
          longitude: "74.3440",
          populationServed: 6,
        },
        {
          lhwId: lhwUser[0].id,
          householdId: "HH-003",
          householdName: "Bibi Community",
          latitude: "31.5505",
          longitude: "74.3445",
          populationServed: 8,
        },
      ])
      .returning();

    console.log("✅ LHW assignments created:", assignments.length);

    // 10. Create Menstrual Hygiene Status Records
    console.log("👩‍⚕️ Creating menstrual hygiene status records...");
    await db.insert(menstrualHygieneStatus).values([
      {
        householdId: "HH-001",
        lhwId: lhwUser[0].id,
        lastCycleDate: new Date("2025-11-10"),
        usesSafeProducts: true,
        notes: "Uses sanitary napkins, good hygiene practices",
      },
      {
        householdId: "HH-002",
        lhwId: lhwUser[0].id,
        lastCycleDate: new Date("2025-11-12"),
        usesSafeProducts: false,
        notes: "Needs education on safe menstrual hygiene products",
      },
      {
        householdId: "HH-003",
        lhwId: lhwUser[0].id,
        lastCycleDate: new Date("2025-11-08"),
        usesSafeProducts: true,
        notes: "Regular cycle tracking, aware of hygiene",
      },
    ]);

    console.log("✅ Menstrual hygiene status created");

    // 11. Create Menstrual Pad Requests
    console.log("📦 Creating menstrual pad requests...");
    await db.insert(menstrualPadRequests).values([
      {
        householdId: "HH-001",
        lhwId: lhwUser[0].id,
        quantityRequested: 20,
        urgencyLevel: "medium",
        status: "pending",
      },
      {
        householdId: "HH-002",
        lhwId: lhwUser[0].id,
        quantityRequested: 30,
        urgencyLevel: "high",
        status: "approved",
      },
      {
        householdId: "HH-003",
        lhwId: lhwUser[0].id,
        quantityRequested: 15,
        urgencyLevel: "low",
        status: "delivered",
      },
    ]);

    console.log("✅ Menstrual pad requests created");

    // 12. Create Menstrual Education Sessions
    console.log("📚 Creating menstrual education sessions...");
    await db.insert(menstrualEducationSessions).values([
      {
        householdId: "HH-001",
        lhwId: lhwUser[0].id,
        materialsProvided: ["handout_cycles", "safe_products_demo", "hygiene_kit"],
        topicsCovered: ["infections", "cycle_tracking", "hygiene"],
        feedbackForm: {
          learned: true,
          practiced: true,
          shared: false,
          confidence: "high",
        },
      },
      {
        householdId: "HH-002",
        lhwId: lhwUser[0].id,
        materialsProvided: ["handout_cycles", "menstrual_calendar"],
        topicsCovered: ["cycle_tracking", "common_myths"],
        feedbackForm: {
          learned: true,
          practiced: false,
          shared: true,
          confidence: "medium",
        },
      },
      {
        householdId: "HH-003",
        lhwId: lhwUser[0].id,
        materialsProvided: ["safe_products_demo", "disposal_guide", "hygiene_kit"],
        topicsCovered: ["infections", "safe_disposal", "hygiene"],
        feedbackForm: {
          learned: true,
          practiced: true,
          shared: true,
          confidence: "high",
        },
      },
    ]);

    console.log("✅ Menstrual education sessions created");

    // 13. Create a test appointment (patient booked)
    console.log("📅 Creating test appointment...");
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7); // Next week
    appointmentDate.setHours(14, 0, 0, 0);

    await db.insert(appointments).values({
      patientId: patient[0].id,
      hospitalId: hospital[0].id,
      doctorId: doctorsCreated[0].id,
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
    console.log("  LHW: lhw_test / LHW123!");
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
