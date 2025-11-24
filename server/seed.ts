import { db } from "./db";
import { 
  users, hospitals, doctors, frontliners, appointments, medicalHistory, medicines,
  lhwAssignments, lhwReports, lhwVaccinations, lhwInventory, lhwEducationSessions,
  menstrualHygieneStatus, menstrualPadRequests, menstrualEducationSessions as menstrualEducationSess,
  donationCauses, donationAccounts, donations, supplyRequests
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
    await db.delete(donations).catch(() => {});
    await db.delete(supplyRequests).catch(() => {});
    await db.delete(menstrualEducationSess).catch(() => {});
    await db.delete(menstrualPadRequests).catch(() => {});
    await db.delete(menstrualHygieneStatus).catch(() => {});
    await db.delete(lhwEducationSessions).catch(() => {});
    await db.delete(lhwVaccinations).catch(() => {});
    await db.delete(lhwInventory).catch(() => {});
    await db.delete(lhwReports).catch(() => {});
    await db.delete(lhwAssignments).catch(() => {});
    await db.delete(frontliners);
    await db.delete(doctors);
    await db.delete(users).where(eq(users.role, 'patient')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'hospital')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'frontliner')).catch(() => {});
    await db.delete(users).where(eq(users.role, 'lhw')).catch(() => {});
    await db.delete(donationAccounts).catch(() => {});
    await db.delete(donationCauses).catch(() => {});
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

    // 9. Create Admin User
    console.log("👨‍💼 Creating admin user...");
    const adminPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
    const adminUser = await db
      .insert(users)
      .values({
        username: "admin_user",
        password: adminPassword,
        role: "admin",
        fullName: "Admin Manager",
        phone: "+92-300-8888888",
        cnic: "11111-1111111-1",
        address: "Admin Office, Lahore",
        age: 40,
      })
      .returning();

    console.log("✅ Admin created:", adminUser[0].id);

    // 10. Create LHW Assignments (Households)
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

    // 11. Create Menstrual Hygiene Status Records
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
    await db.insert(menstrualEducationSess).values([
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

    // 13. Create LHW Reports (Health Visits)
    console.log("📋 Creating LHW health visit reports...");
    const nextVisitDate = new Date();
    nextVisitDate.setDate(nextVisitDate.getDate() + 14);
    
    await db.insert(lhwReports).values([
      {
        lhwId: lhwUser[0].id,
        patientId: patient[0].id,
        visitType: "maternal",
        notes: "Antenatal checkup completed. BP normal, no complications.",
        vitals: {
          weight: 68.5,
          bloodPressure: "120/80",
          temperature: 98.6,
        },
        nextVisitDate: nextVisitDate,
      },
      {
        lhwId: lhwUser[0].id,
        patientId: "CHILD-001",
        visitType: "child",
        notes: "Growth monitoring done. Child weight appropriate for age.",
        vitals: {
          weight: 15.2,
          height: 82,
          temperature: 98.4,
        },
        nextVisitDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
      {
        lhwId: lhwUser[0].id,
        patientId: "CHRONIC-001",
        visitType: "chronic",
        notes: "Diabetes management follow-up. Patient compliant with medication.",
        vitals: {
          weight: 75,
          bloodPressure: "125/82",
          temperature: 98.5,
        },
        nextVisitDate: new Date(new Date().setDate(new Date().getDate() + 21)),
      },
      {
        lhwId: lhwUser[0].id,
        visitType: "vaccination",
        notes: "Routine immunization clinic completed. 12 children vaccinated.",
        vitals: { clinicParticipants: 12 },
        nextVisitDate: new Date(new Date().setDate(new Date().getDate() + 28)),
      },
    ]);

    console.log("✅ LHW health visit reports created");

    // 14. Create Vaccination Records
    console.log("💉 Creating vaccination records...");
    const today = new Date();
    const dueDate1 = new Date(today);
    dueDate1.setDate(dueDate1.getDate() + 5);
    const dueDate2 = new Date(today);
    dueDate2.setDate(dueDate2.getDate() - 10);
    const dueDate3 = new Date(today);
    dueDate3.setDate(dueDate3.getDate() + 30);

    await db.insert(lhwVaccinations).values([
      {
        childId: "CHILD-001",
        lhwId: lhwUser[0].id,
        vaccine: "BCG",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 45)),
        status: "completed",
        completedAt: new Date(new Date().setDate(new Date().getDate() - 40)),
      },
      {
        childId: "CHILD-001",
        lhwId: lhwUser[0].id,
        vaccine: "DPT",
        dueDate: dueDate1,
        status: "pending",
      },
      {
        childId: "CHILD-002",
        lhwId: lhwUser[0].id,
        vaccine: "Polio",
        dueDate: dueDate2,
        status: "overdue",
      },
      {
        childId: "CHILD-002",
        lhwId: lhwUser[0].id,
        vaccine: "Hepatitis B",
        dueDate: dueDate3,
        status: "pending",
      },
      {
        childId: "CHILD-003",
        lhwId: lhwUser[0].id,
        vaccine: "Measles",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        status: "pending",
      },
    ]);

    console.log("✅ Vaccination records created");

    // 15. Create LHW Inventory
    console.log("📦 Creating LHW inventory...");
    const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
    
    await db.insert(lhwInventory).values([
      {
        lhwId: lhwUser[0].id,
        itemType: "vaccine",
        itemName: "BCG Vaccine",
        quantity: 45,
        minThreshold: 20,
        reorderStatus: "in_stock",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "vaccine",
        itemName: "DPT Vaccine",
        quantity: 8,
        minThreshold: 15,
        reorderStatus: "low",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "vaccine",
        itemName: "Polio Vaccine",
        quantity: 0,
        minThreshold: 15,
        reorderStatus: "out_of_stock",
        lastRestockedAt: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "medicine",
        itemName: "Iron Supplements",
        quantity: 120,
        minThreshold: 50,
        reorderStatus: "in_stock",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "medicine",
        itemName: "Paracetamol Syrup",
        quantity: 18,
        minThreshold: 30,
        reorderStatus: "low",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "supplies",
        itemName: "Antiseptic Swabs",
        quantity: 200,
        minThreshold: 100,
        reorderStatus: "in_stock",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "supplies",
        itemName: "Syringes (10ml)",
        quantity: 35,
        minThreshold: 50,
        reorderStatus: "low",
        lastRestockedAt: lastWeek,
      },
      {
        lhwId: lhwUser[0].id,
        itemType: "supplies",
        itemName: "Examination Gloves",
        quantity: 500,
        minThreshold: 200,
        reorderStatus: "in_stock",
        lastRestockedAt: lastWeek,
      },
    ]);

    console.log("✅ LHW inventory created");

    // 16. Create LHW Education Sessions (Past and Future)
    console.log("📚 Creating LHW education sessions (awareness & planned)...");
    const pastSession = new Date();
    pastSession.setDate(pastSession.getDate() - 7);
    
    const futureSession1 = new Date();
    futureSession1.setDate(futureSession1.getDate() + 5);
    
    const futureSession2 = new Date();
    futureSession2.setDate(futureSession2.getDate() + 12);
    
    const futureSession3 = new Date();
    futureSession3.setDate(futureSession3.getDate() + 20);

    // Create education sessions with notes that include session dates for future planning
    await db.insert(lhwEducationSessions).values([
      {
        lhwId: lhwUser[0].id,
        topic: "maternal-health",
        audienceSize: 15,
        notes: `PAST SESSION (${pastSession.toLocaleDateString()}): Taught antenatal care, nutrition, and warning signs during pregnancy. Distributed information pamphlets.`,
      },
      {
        lhwId: lhwUser[0].id,
        topic: "child-nutrition",
        audienceSize: 20,
        notes: `PAST SESSION (${new Date(new Date().setDate(new Date().getDate() - 14)).toLocaleDateString()}): Covered infant feeding, complementary foods, and nutrition for children 6-24 months.`,
      },
      {
        lhwId: lhwUser[0].id,
        topic: "family-planning",
        audienceSize: 12,
        notes: `UPCOMING SESSION (${futureSession1.toLocaleDateString()}): Family planning methods, benefits, and addressing myths. Interactive Q&A session planned.`,
      },
      {
        lhwId: lhwUser[0].id,
        topic: "menstrual-health",
        audienceSize: 18,
        notes: `UPCOMING SESSION (${futureSession2.toLocaleDateString()}): Comprehensive menstrual hygiene education, safe products, disposal methods, and addressing stigma.`,
      },
      {
        lhwId: lhwUser[0].id,
        topic: "disease-prevention",
        audienceSize: 25,
        notes: `UPCOMING SESSION (${futureSession3.toLocaleDateString()}): Prevention of communicable diseases, hygiene practices, vaccination importance, and seasonal health risks.`,
      },
      {
        lhwId: lhwUser[0].id,
        topic: "immunization-awareness",
        audienceSize: 30,
        notes: `UPCOMING SESSION (${new Date(new Date().setDate(new Date().getDate() + 28)).toLocaleDateString()}): Complete immunization schedule, vaccine benefits, side effects, and addressing vaccine hesitancy.`,
      },
    ]);

    console.log("✅ LHW education sessions created");

    // 18. Create Donation Causes
    console.log("💝 Creating donation causes...");
    const causes = await db.insert(donationCauses).values([
      {
        title: "Vaccination Programs",
        description: "Support immunization camps and vaccine distribution in underserved communities",
        active: true,
      },
      {
        title: "Menstrual Hygiene Support",
        description: "Fund sanitary pad distribution and hygiene awareness programs",
        active: true,
      },
      {
        title: "Emergency Health Funds",
        description: "Rapid response to health emergencies and disaster relief",
        active: true,
      },
      {
        title: "LHW Field Operations",
        description: "Support Lady Health Workers with supplies and operational costs",
        active: true,
      },
    ]).returning();

    console.log("✅ Donation causes created");

    // 19. Create Donation Accounts
    console.log("🏦 Creating donation accounts...");
    await db.insert(donationAccounts).values([
      {
        accountTitle: "Primary Donation Account",
        bankName: "Habib Bank Limited",
        accountNumber: "1234567890",
        iban: "PK36ABOC0000001234567890",
        isActive: true,
      },
      {
        accountTitle: "JazzCash Donations",
        jazzcashNumber: "03001234567",
        isActive: true,
      },
      {
        accountTitle: "EasyPaisa Donations",
        easypaisaNumber: "03009876543",
        isActive: true,
      },
    ]);

    console.log("✅ Donation accounts created");

    // 20. Create Sample Donations
    console.log("💰 Creating sample donations...");
    const sampleDonations = await db.insert(donations).values([
      {
        userId: patient[0].id,
        causeId: causes[0].id,
        amount: 50000,
        paymentMethod: "bank_transfer",
        receiptNumber: "RCP-001",
      },
      {
        causeId: causes[1].id,
        amount: 25000,
        paymentMethod: "jazzcash",
      },
      {
        userId: patient[0].id,
        causeId: causes[2].id,
        amount: 100000,
        paymentMethod: "bank_transfer",
        receiptNumber: "RCP-002",
      },
    ]).returning();

    console.log("✅ Sample donations created");

    // 21. Create Sample Supply Requests
    console.log("📋 Creating sample supply requests...");
    await db.insert(supplyRequests).values([
      {
        lhwId: lhwUser[0].id,
        supplyType: "pad",
        quantity: 500,
        priorityLevel: "high",
        reason: "Distribution campaign for underserved villages",
        status: "pending",
      },
      {
        lhwId: lhwUser[0].id,
        supplyType: "vaccine",
        quantity: 200,
        priorityLevel: "medium",
        reason: "Routine immunization clinic",
        status: "approved",
      },
      {
        lhwId: lhwUser[0].id,
        supplyType: "medicine",
        quantity: 50,
        priorityLevel: "low",
        reason: "Inventory replenishment",
        status: "fulfilled",
      },
    ]);

    console.log("✅ Supply requests created");

    // 23. Create a test appointment (patient booked)
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
    console.log("  Admin: admin_user / Admin123!");
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
