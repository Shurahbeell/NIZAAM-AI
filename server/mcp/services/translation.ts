import { gemini } from "../index";

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Translation service for Urdu/English bilingual support
 * Uses Gemini 2.5 Flash for high-quality contextual translation
 */
export class TranslationService {
  /**
   * Translate text between Urdu and English
   */
  async translate(
    text: string,
    targetLanguage: "urdu" | "english",
    context?: string
  ): Promise<string> {
    const systemPrompt = this.getTranslationPrompt(targetLanguage, context);
    
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + text }] }
        ]
      });
      
      return response.text?.trim() || text;
    } catch (error) {
      console.error("[Translation] Error translating text:", error);
      return text; // Fallback to original text
    }
  }

  /**
   * Detect language of input text
   */
  async detectLanguage(text: string): Promise<"urdu" | "english"> {
    // Simple heuristic: Check for Urdu Unicode range
    const urduPattern = /[\u0600-\u06FF]/;
    
    if (urduPattern.test(text)) {
      return "urdu";
    }
    
    return "english";
  }

  /**
   * Get translation prompt based on target language
   */
  private getTranslationPrompt(targetLanguage: "urdu" | "english", context?: string): string {
    const contextNote = context ? `\n\nContext: ${context}` : "";
    
    if (targetLanguage === "urdu") {
      return `You are a professional translator specializing in medical and healthcare terminology. Translate the following English text to Urdu (اردو).

Rules:
1. Maintain medical terminology accuracy
2. Use formal, respectful language appropriate for healthcare
3. Keep medical terms in English if they are commonly used in Pakistan (e.g., "emergency", "hospital")
4. Translate naturally - do not transliterate word-by-word
5. Return ONLY the Urdu translation, nothing else${contextNote}`;
    } else {
      return `You are a professional translator specializing in medical and healthcare terminology. Translate the following Urdu (اردو) text to English.

Rules:
1. Maintain medical terminology accuracy
2. Translate naturally and idiomatically
3. Preserve the original meaning and tone
4. Return ONLY the English translation, nothing else${contextNote}`;
    }
  }

  /**
   * Translate array of messages while preserving structure
   */
  async translateMessages(
    messages: Array<{ role: string; content: string }>,
    targetLanguage: "urdu" | "english"
  ): Promise<Array<{ role: string; content: string }>> {
    const translated = await Promise.all(
      messages.map(async (msg) => ({
        role: msg.role,
        content: await this.translate(msg.content, targetLanguage)
      }))
    );
    
    return translated;
  }
}

export const translationService = new TranslationService();
