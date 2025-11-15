// Shared types for the Multi-Agent System

export interface AgentResponse {
  content: string;
  reasoning?: string;
  confidence?: number;
  nextAction?: string;
  metadata?: Record<string, any>;
}

export interface TriageResult {
  urgency: "self-care" | "bhu-visit" | "emergency";
  symptoms: string[];
  recommendedActions: string[];
  facilityType?: string;
  reasoning: string;
}

export interface EligibilityResult {
  eligiblePrograms: string[];
  requiredDocuments: string[];
  applicationForms: Record<string, any>[];
  nextSteps: string[];
}

export interface FacilityRecommendation {
  facilityId: string;
  facilityName: string;
  distance: number;
  availability: boolean;
  rating: number;
  reasons: string[];
}

export interface ReminderSchedule {
  type: string;
  frequency: string;
  nextDueDate: Date;
  enabled: boolean;
}

export interface ProtocolReference {
  source: string;
  title: string;
  url?: string;
  relevanceScore: number;
  summary: string;
}

export interface OutbreakAlert {
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedAreas: string[];
  caseCount: number;
  trend: "increasing" | "stable" | "decreasing";
  recommendations: string[];
}
