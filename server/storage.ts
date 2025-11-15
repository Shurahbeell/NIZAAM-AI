import { 
  type User, 
  type InsertUser,
  type Emergency,
  type InsertEmergency,
  type WomensHealthAwareness,
  type InsertWomensHealthAwareness,
  type ScreeningReminder,
  type InsertScreeningReminder
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Emergency methods
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  getAllEmergencies(): Promise<Emergency[]>;
  getEmergencyById(id: string): Promise<Emergency | undefined>;
  updateEmergencyStatus(id: string, status: string): Promise<Emergency | undefined>;
  
  // Women's Health Awareness methods
  getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]>;
  getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined>;
  
  // Screening Reminder methods
  createScreeningReminder(reminder: InsertScreeningReminder): Promise<ScreeningReminder>;
  getUserScreeningReminders(userId: string): Promise<ScreeningReminder[]>;
  updateScreeningReminder(id: string, updates: Partial<ScreeningReminder>): Promise<ScreeningReminder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emergencies: Map<string, Emergency>;
  private womensHealthTopics: Map<string, WomensHealthAwareness>;
  private screeningReminders: Map<string, ScreeningReminder>;

  constructor() {
    this.users = new Map();
    this.emergencies = new Map();
    this.womensHealthTopics = new Map();
    this.screeningReminders = new Map();
    
    // Seed women's health topics
    this.seedWomensHealthTopics();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role ?? "patient",
      hospitalId: null
    };
    this.users.set(id, user);
    return user;
  }

  // Emergency methods
  async createEmergency(insertEmergency: InsertEmergency): Promise<Emergency> {
    const id = randomUUID();
    const emergency: Emergency = { 
      id,
      patientId: insertEmergency.patientId ?? null,
      patientName: insertEmergency.patientName,
      patientPhone: insertEmergency.patientPhone,
      location: insertEmergency.location ?? null,
      emergencyType: insertEmergency.emergencyType,
      priority: insertEmergency.priority,
      symptoms: insertEmergency.symptoms,
      status: insertEmergency.status ?? "active",
      assignedHospitalId: insertEmergency.assignedHospitalId ?? null,
      notes: insertEmergency.notes ?? null,
      createdAt: new Date()
    };
    this.emergencies.set(id, emergency);
    return emergency;
  }

  async getAllEmergencies(): Promise<Emergency[]> {
    return Array.from(this.emergencies.values()).sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }

  async getEmergencyById(id: string): Promise<Emergency | undefined> {
    return this.emergencies.get(id);
  }

  async updateEmergencyStatus(id: string, status: string): Promise<Emergency | undefined> {
    const emergency = this.emergencies.get(id);
    if (!emergency) return undefined;
    
    const updated = { ...emergency, status };
    this.emergencies.set(id, updated);
    return updated;
  }

  // Women's Health Awareness methods
  async getAllWomensHealthTopics(): Promise<WomensHealthAwareness[]> {
    return Array.from(this.womensHealthTopics.values());
  }

  async getWomensHealthTopicById(id: string): Promise<WomensHealthAwareness | undefined> {
    return this.womensHealthTopics.get(id);
  }

  // Screening Reminder methods
  async createScreeningReminder(insertReminder: InsertScreeningReminder): Promise<ScreeningReminder> {
    const id = randomUUID();
    const reminder: ScreeningReminder = {
      id,
      userId: insertReminder.userId,
      topic: insertReminder.topic,
      reminderType: insertReminder.reminderType,
      nextDueDate: insertReminder.nextDueDate,
      frequency: insertReminder.frequency ?? null,
      notificationSent: insertReminder.notificationSent ?? false,
      isEnabled: insertReminder.isEnabled ?? true,
      createdAt: new Date()
    };
    this.screeningReminders.set(id, reminder);
    return reminder;
  }

  async getUserScreeningReminders(userId: string): Promise<ScreeningReminder[]> {
    return Array.from(this.screeningReminders.values())
      .filter(r => r.userId === userId);
  }

  async updateScreeningReminder(id: string, updates: Partial<ScreeningReminder>): Promise<ScreeningReminder | undefined> {
    const reminder = this.screeningReminders.get(id);
    if (!reminder) return undefined;
    
    const updated = { ...reminder, ...updates };
    this.screeningReminders.set(id, updated);
    return updated;
  }

  private seedWomensHealthTopics() {
    const topics: Omit<WomensHealthAwareness, "id" | "createdAt">[] = [
      {
        topic: "breast-cancer",
        title: "Breast Cancer Awareness",
        description: "Breast cancer is one of the most common cancers affecting women worldwide. Early detection through regular screening and self-examination can significantly improve treatment outcomes.",
        riskFactors: ["Age (over 50 years)", "Family history of breast cancer", "Personal history of breast conditions", "Early menstruation (before 12) or late menopause", "Never having children or late pregnancy", "Obesity and sedentary lifestyle", "Hormone replacement therapy"],
        preventionTips: ["Perform monthly breast self-examinations", "Get regular mammograms (age 40+)", "Maintain healthy weight through diet and exercise", "Limit alcohol consumption", "Breastfeed if possible", "Avoid prolonged hormone therapy", "Know your family history"],
        resources: ["Pakistan Cancer Society - Breast Cancer Awareness", "Shaukat Khanum Memorial Cancer Hospital", "World Health Organization - Breast Cancer"],
        imageUrl: null
      },
      {
        topic: "cervical-cancer",
        title: "Cervical Cancer Prevention",
        description: "Cervical cancer is preventable through HPV vaccination and regular Pap smear screening. Most cases are caused by Human Papillomavirus (HPV) infection.",
        riskFactors: ["HPV infection", "Multiple sexual partners", "Early sexual activity", "Weakened immune system", "Smoking", "Long-term use of contraceptive pills"],
        preventionTips: ["Get HPV vaccination (ages 9-26)", "Regular Pap smear tests (every 3 years for ages 21-65)", "Practice safe sex", "Quit smoking", "Maintain healthy immune system"],
        resources: ["Pakistan Medical Association - Cervical Cancer Prevention", "WHO HPV Vaccination Program", "Ministry of Health Pakistan"],
        imageUrl: null
      },
      {
        topic: "maternal-health",
        title: "Pregnancy & Maternal Health",
        description: "Proper prenatal care and awareness of warning signs can ensure a healthy pregnancy and safe delivery for both mother and baby.",
        riskFactors: ["Age under 18 or over 35", "Pre-existing conditions (diabetes, hypertension)", "Previous pregnancy complications", "Multiple pregnancies (twins/triplets)", "Obesity or being underweight", "Smoking or substance use"],
        preventionTips: ["Attend all antenatal checkups", "Take prenatal vitamins (folic acid, iron)", "Eat nutritious diet", "Get recommended vaccinations", "Avoid alcohol, smoking, and drugs", "Manage stress and get adequate rest", "Monitor fetal movements"],
        resources: ["Lady Health Workers Program Pakistan", "UNICEF Pakistan - Maternal Health", "Ministry of Health - Mother & Child Care"],
        imageUrl: null
      }
    ];

    topics.forEach(topic => {
      const id = randomUUID();
      this.womensHealthTopics.set(id, {
        ...topic,
        id,
        createdAt: new Date()
      });
    });
  }
}

export const storage = new MemStorage();
