import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users, hospitals, emergencies, womensHealthAwareness } from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create patient user
    const patientPassword = await bcrypt.hash("patient123", 10);
    const [patient] = await db
      .insert(users)
      .values({
        username: "patient",
        password: patientPassword,
        role: "patient",
      })
      .returning();
    console.log("✓ Created patient user (username: patient, password: patient123)");

    // Create hospitals
    const [hospital1] = await db
      .insert(hospitals)
      .values({
        name: "Jinnah Hospital",
        address: "Ferozepur Road, Lahore",
        phone: "+92-42-111-222-333",
        email: "info@jinnahhospital.pk",
        type: "government",
        facilities: ["Emergency", "Cardiology", "Surgery", "Pediatrics", "ICU"],
      })
      .returning();

    const [hospital2] = await db
      .insert(hospitals)
      .values({
        name: "Services Hospital",
        address: "Jail Road, Lahore",
        phone: "+92-42-444-555-666",
        email: "info@serviceshospital.pk",
        type: "government",
        facilities: ["Emergency", "General Medicine", "Surgery", "Obstetrics"],
      })
      .returning();

    const [hospital3] = await db
      .insert(hospitals)
      .values({
        name: "Agha Khan University Hospital",
        address: "Stadium Road, Karachi",
        phone: "+92-21-111-911-911",
        email: "info@aku.edu",
        type: "private",
        facilities: ["Emergency", "Cardiology", "Oncology", "Surgery", "ICU", "Nephrology"],
      })
      .returning();

    console.log(`✓ Created ${3} hospitals`);

    // Create hospital admin users
    const hospital1Password = await bcrypt.hash("hospital123", 10);
    const [hospitalAdmin1] = await db
      .insert(users)
      .values({
        username: "jinnah_admin",
        password: hospital1Password,
        role: "hospital",
        hospitalId: hospital1.id,
      })
      .returning();

    const [hospitalAdmin2] = await db
      .insert(users)
      .values({
        username: "services_admin",
        password: hospital1Password,
        role: "hospital",
        hospitalId: hospital2.id,
      })
      .returning();

    console.log(
      "✓ Created hospital admin users (username: jinnah_admin, services_admin, password: hospital123)"
    );

    // Create sample emergency
    await db.insert(emergencies).values({
      patientId: patient.id,
      patientName: "Ahmed Khan",
      patientPhone: "+92-300-1234567",
      location: "Model Town, Lahore",
      emergencyType: "medical",
      priority: "high",
      symptoms: "Severe chest pain, difficulty breathing",
      status: "active",
    });

    console.log("✓ Created sample emergency");

    // Create women's health awareness topics
    await db.insert(womensHealthAwareness).values([
      {
        topic: "breast-cancer",
        title: "Breast Cancer Awareness",
        description:
          "Breast cancer is one of the most common cancers affecting women worldwide. Early detection through self-examination and regular screenings is crucial.",
        riskFactors: [
          "Family history",
          "Age over 50",
          "Early menstruation",
          "Late menopause",
          "Obesity",
        ],
        preventionTips: [
          "Monthly self-examination",
          "Annual mammograms after 40",
          "Maintain healthy weight",
          "Regular exercise",
          "Limit alcohol consumption",
        ],
        resources: [
          "https://www.who.int/cancer/prevention/diagnosis-screening/breast-cancer",
          "Pakistan Cancer Registry",
        ],
      },
      {
        topic: "maternal-health",
        title: "Maternal Health & Pregnancy Care",
        description:
          "Proper prenatal care is essential for the health of both mother and baby. Regular checkups, proper nutrition, and awareness of warning signs can prevent complications.",
        riskFactors: [
          "Pre-existing health conditions",
          "Multiple pregnancies",
          "Age under 17 or over 35",
          "Poor nutrition",
          "Lack of prenatal care",
        ],
        preventionTips: [
          "Regular prenatal checkups",
          "Balanced diet with folic acid",
          "Avoid smoking and alcohol",
          "Manage stress",
          "Stay physically active",
        ],
        resources: [
          "https://www.who.int/maternal-health",
          "Pakistan Maternal Health Initiative",
        ],
      },
      {
        topic: "cervical-cancer",
        title: "Cervical Cancer Prevention",
        description:
          "Cervical cancer is largely preventable through HPV vaccination and regular screening. Early detection significantly improves treatment outcomes.",
        riskFactors: [
          "HPV infection",
          "Smoking",
          "Weakened immune system",
          "Multiple sexual partners",
          "Early sexual activity",
        ],
        preventionTips: [
          "HPV vaccination",
          "Regular Pap smear tests",
          "Practice safe sex",
          "Quit smoking",
          "Annual gynecological exams",
        ],
        resources: [
          "https://www.who.int/cancer/prevention/diagnosis-screening/cervical-cancer",
          "Pakistan Cancer Society",
        ],
      },
    ]);

    console.log("✓ Created women's health awareness topics");

    console.log("\n✅ Seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Patient: username=patient, password=patient123");
    console.log("   Hospital Admin 1: username=jinnah_admin, password=hospital123");
    console.log("   Hospital Admin 2: username=services_admin, password=hospital123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
