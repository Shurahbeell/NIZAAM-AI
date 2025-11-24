import { Router, type Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { insertAgentSessionSchema } from "@shared/schema";

const router = Router();

// Create new agent session (authenticated users only)
router.post("/sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    const { agent, language } = req.body;

    // Always create session for authenticated user - ignore userId from request
    const data = insertAgentSessionSchema.parse({
      userId: req.user!.userId, // Always use authenticated user
      agent,
      language: language || "english",
      status: "active",
    });

    const session = await storage.createAgentSession(data);
    res.json(session);
  } catch (error: any) {
    console.error("[Agents] Create session error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get agent session (owner only)
router.get("/sessions/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const session = await storage.getAgentSession(req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Ensure user can only access their own sessions
    if (session.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(session);
  } catch (error: any) {
    console.error("[Agents] Get session error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's agent sessions
router.get("/sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    const sessions = await storage.getUserAgentSessions(req.user!.userId);
    res.json(sessions);
  } catch (error: any) {
    console.error("[Agents] Get user sessions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send message to agent
router.post("/chat", requireAuth, async (req: Request, res: Response) => {
  try {
    const { sessionId, agentName, message, language = "english" } = req.body;

    if (!sessionId || !agentName || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify session belongs to user
    const session = await storage.getAgentSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify agent name matches session agent
    if (session.agent !== agentName) {
      return res.status(400).json({ 
        error: "Agent mismatch",
        details: `Session is for ${session.agent}, but you're trying to message ${agentName}`
      });
    }

    // Validate agent name is allowed
    const validAgents = ["triage", "eligibility", "facility", "followup", "analytics", "knowledge"];
    if (!validAgents.includes(agentName)) {
      return res.status(400).json({ error: "Invalid agent name" });
    }

    // Save user message to database
    await storage.createAgentMessage({
      sessionId,
      senderType: "user",
      content: message,
      language
    });

    // Import agentRegistry dynamically to avoid circular dependency
    const { agentRegistry } = await import("../mcp/index");

    // Route to appropriate agent
    const response = await agentRegistry.routeMessage(agentName, sessionId, message, language);

    res.json({ response });
  } catch (error: any) {
    console.error("[Agents] Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history (owner only)
router.get("/messages/:sessionId", requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify session belongs to user
    const session = await storage.getAgentSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await storage.getSessionMessages(req.params.sessionId);
    res.json(messages);
  } catch (error: any) {
    console.error("[Agents] Get messages error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent events for session (owner only)
router.get("/events/:sessionId", requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify session belongs to user
    const session = await storage.getAgentSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const events = await storage.getAllAgentEvents();
    // Filter by session
    const sessionEvents = events.filter((e) => e.triggeredBySession === req.params.sessionId);
    res.json(sessionEvents);
  } catch (error: any) {
    console.error("[Agents] Get events error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Menstrual Health Advisor Chat
router.post("/menstrual-chat", requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, topic = "general", language = "en" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const topicDescriptions: { [key: string]: string } = {
      general: "General menstrual health",
      products: "Safe menstrual products",
      hygiene: "Hygiene and sanitation practices",
      tracking: "Menstrual cycle tracking",
      infections: "Infection prevention",
      adolescent: "Adolescent menstrual health",
    };

    const languageMap: { [key: string]: string } = {
      en: "English",
      ur: "Urdu",
      ru: "Roman Urdu",
    };

    // Generate response using OpenAI API (since Gemini integration might not be fully set up)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return mock response if no API key available
      return res.json({
        response: `I'm the Menstrual Health Advisor here to help with information about ${topicDescriptions[topic] || "menstrual health"}. For serious concerns, please consult a healthcare professional.`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a caring and knowledgeable Menstrual Health Advisor for Lady Health Workers (LHWs) in Pakistan. Focus on: ${topicDescriptions[topic] || "menstrual health"}. Respond in ${languageMap[language] || "English"}. Be warm, supportive, and culturally sensitive. Provide evidence-based information about menstrual health, hygiene, safe products, and wellness. Always recommend consulting healthcare professionals for serious concerns.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get response from AI");
    }

    const responseText = data.choices[0]?.message?.content || "No response generated";

    res.json({ response: responseText });
  } catch (error: any) {
    console.error("[Agents] Menstrual chat error:", error);
    res.status(500).json({
      error: "Failed to get response from AI advisor",
      details: error.message,
    });
  }
});

export default router;
