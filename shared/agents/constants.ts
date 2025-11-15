// Constants for the Multi-Agent System

export const AGENT_TYPES = {
  TRIAGE: "triage",
  ELIGIBILITY: "eligibility",
  FACILITY: "facility",
  FOLLOWUP: "followup",
  ANALYTICS: "analytics",
  KNOWLEDGE: "knowledge"
} as const;

export const EVENT_TYPES = {
  // Triage events
  EMERGENCY_REQUESTED: "EmergencyRequested",
  EMERGENCY_CREATED: "EmergencyCreated",
  
  // Eligibility events
  ELIGIBILITY_CHECK_REQUESTED: "EligibilityCheckRequested",
  ELIGIBILITY_REPORT_GENERATED: "EligibilityReportGenerated",
  
  // Facility events
  FACILITY_SEARCH_REQUESTED: "FacilitySearchRequested",
  FACILITY_RECOMMENDED: "FacilityRecommended",
  
  // Follow-up events
  REMINDER_SCHEDULED: "ReminderScheduled",
  REMINDER_SENT: "ReminderSent",
  
  // Analytics events
  PROTOCOL_RETRIEVED: "ProtocolRetrieved",
  GUIDANCE_PROVIDED: "GuidanceProvided",
  
  // Knowledge events
  PATTERN_DETECTED: "PatternDetected",
  ALERT_RAISED: "AlertRaised"
} as const;

export const URGENCY_LEVELS = {
  SELF_CARE: "self-care",
  BHU_VISIT: "bhu-visit",
  EMERGENCY: "emergency"
} as const;

export const PAKISTAN_HEALTH_PROGRAMS = [
  {
    id: "sehat-card",
    name: "Sehat Sahulat Program (Health Card)",
    description: "Free medical treatment up to Rs. 1,000,000 per family per year",
    eligibility: ["Below poverty line", "Low-income families"]
  },
  {
    id: "epi-vaccines",
    name: "Expanded Program on Immunization (EPI)",
    description: "Free vaccines for children and pregnant women",
    eligibility: ["All children under 5", "Pregnant women"]
  },
  {
    id: "lady-health-workers",
    name: "Lady Health Workers Program",
    description: "Free maternal and child healthcare at doorstep",
    eligibility: ["Rural areas", "Women and children"]
  },
  {
    id: "tb-control",
    name: "National TB Control Program",
    description: "Free diagnosis and treatment for tuberculosis",
    eligibility: ["TB patients", "High-risk individuals"]
  },
  {
    id: "hepatitis-control",
    name: "Hepatitis Control Program",
    description: "Free screening and treatment for Hepatitis B & C",
    eligibility: ["All citizens", "High-risk groups"]
  }
  // Add remaining 15 programs as needed
];
