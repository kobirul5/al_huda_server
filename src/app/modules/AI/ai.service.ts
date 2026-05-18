import axios, { AxiosError } from "axios";
import { IAISuggestion, IIslamicSuggestionRequest, IOpenRouterResponse, IReference } from "./ai.interface";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

export class AIServices {
  // Generate Islamic suggestion with Quran and Hadith references
  static async getIslamicSuggestion(
    data: IIslamicSuggestionRequest
  ): Promise<IAISuggestion> {
    try {
      // Check if API key is configured
      if (!OPENROUTER_API_KEY) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "OpenRouter API key is not configured"
        );
      }

      const systemPrompt = this.buildSystemPrompt(data.language || "en", data.category);
      const userPrompt = this.buildUserPrompt(data.prompt, data.language || "en");

      const response = await axios.post<IOpenRouterResponse>(
        OPENROUTER_API_URL,
        {
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://alhuda.app",
            "X-Title": "Al Huda Islamic Assistant",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.choices[0]?.message?.content) {
        throw new ApiError(
          httpStatus.BAD_GATEWAY,
          "Failed to get suggestion from AI"
        );
      }

      const aiResponse = response.data.choices[0].message.content;
      const parsedResponse = this.parseAIResponse(aiResponse);

      return {
        prompt: data.prompt,
        suggestion: parsedResponse.suggestion,
        references: parsedResponse.references,
        category: data.category || "general",
        createdAt: new Date(),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const errorData = error.response?.data as any;
        const errorMessage = errorData?.error?.message || errorData?.message || error.message;
        
        throw new ApiError(
          status === 401 ? httpStatus.UNAUTHORIZED : httpStatus.BAD_GATEWAY,
          `OpenRouter API Error (${status}): ${errorMessage}`
        );
      }
      throw error;
    }
  }

  // Build system prompt for Islamic guidance
  private static buildSystemPrompt(language: "en" | "bn" = "en", category?: string): string {
    const languagePart =
      language === "bn"
        ? "আপনি একজন ইসলামিক পণ্ডিত এবং সহায়ক। প্রতিটি উত্তরে কুরআন এবং হাদিস থেকে প্রাসঙ্গিক উদ্ধৃতি অন্তর্ভুক্ত করুন। বাংলায় উত্তর দিন।"
        : "You are an Islamic scholar and helpful assistant. For every suggestion, include relevant Quranic verses and Hadith references. Provide responses in English.";

    const categoryPart =
      category === "quran"
        ? "Focus on Quranic guidance and Islamic principles."
        : category === "hadith"
          ? "Focus on Hadith (prophetic traditions) and Islamic practices."
          : "Provide balanced Islamic guidance from both Quran and Hadith.";

    return `${languagePart}\n${categoryPart}\n\nFormat your response as a strictly valid raw JSON object. Do not wrap the JSON in markdown code blocks or backticks. Do not include any text, explanations, or backticks before or after the JSON. Ensure all quotes inside string values are properly escaped and strings close correctly. Use the following structure:
{
  "suggestion": "Your Islamic suggestion or guidance here",
  "references": [
    {
      "type": "quran" or "hadith",
      "title": "Title of the reference",
      "reference": "Reference format (e.g., 'Surah Al-Baqarah 2:255' or 'Sahih Bukhari 3897')",
      "text": "The actual verse or hadith text",
      "explanation": "Brief explanation of why this is relevant"
    }
  ]
}`;
  }

  // Build user prompt
  private static buildUserPrompt(prompt: string, language: "en" | "bn" = "en"): string {
    if (language === "bn") {
      return `আমার প্রশ্ন: ${prompt}\n\nদয়া করে ইসলামিক দৃষ্টিভঙ্গি থেকে এই প্রশ্নের উত্তর দিন এবং প্রাসঙ্গিক কুরআন এবং হাদিসের রেফারেন্স সহ।`;
    }
    return `Question: ${prompt}\n\nPlease provide an Islamic perspective on this question with relevant Quranic verses and Hadith references.`;
  }

  // Parse AI response and extract references
  private static parseAIResponse(response: string): {
    suggestion: string;
    references: IReference[];
  } {
    try {
      // 1. Clean markdown code block wraps
      let cleaned = response.trim();
      cleaned = cleaned.replace(/^```json\s*/i, "");
      cleaned = cleaned.replace(/```\s*$/i, "");
      cleaned = cleaned.trim();

      // 2. Locate first '{' and last '}'
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON braces found");
      }
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);

      // 3. Try to clean literal unescaped newlines within double quotes (common in LLMs)
      let sanitized = cleaned;
      sanitized = sanitized.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, stringContent) => {
        return '"' + stringContent.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });

      // 4. Try parsing the sanitized JSON
      const parsed = JSON.parse(sanitized);
      
      // Make sure the fields are extracted and clean
      let finalSuggestion = parsed.suggestion || response;
      // Clean markdown codeblocks from suggestion if AI nested it inside
      if (typeof finalSuggestion === "string") {
        finalSuggestion = finalSuggestion.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      }

      return {
        suggestion: finalSuggestion,
        references: parsed.references || [],
      };
    } catch (error) {
      console.warn("[AI Parser] Strict JSON parsing failed, using bulletproof Regex Fallback...", error);

      // Fallback 1: Extract "suggestion" field using Regex
      const suggestionMatch = response.match(/"suggestion"\s*:\s*"([\s\S]*?)"\s*,\s*"references"/i)
        || response.match(/"suggestion"\s*:\s*"([\s\S]*?)"/i);
      
      let suggestion = "";
      if (suggestionMatch) {
        suggestion = suggestionMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
      } else {
        // As a last resort, treat the entire cleaned text as the suggestion
        suggestion = response.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      }

      // Fallback 2: Parse "references" array using Regex
      const references: IReference[] = [];
      const refBlockMatch = response.match(/"references"\s*:\s*\[([\s\S]*)\]/i);
      if (refBlockMatch) {
        // Split individual object blocks inside the array
        const refItemsRaw = refBlockMatch[1].split(/\}\s*,\s*\{/);
        for (const itemRaw of refItemsRaw) {
          const typeMatch = itemRaw.match(/"type"\s*:\s*"([^"]*)"/i);
          const titleMatch = itemRaw.match(/"title"\s*:\s*"([^"]*)"/i);
          const refMatch = itemRaw.match(/"reference"\s*:\s*"([^"]*)"/i);
          
          // Regex extract "text" and "explanation" values
          const textMatch = itemRaw.match(/"text"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"explanation"|\s*\})/i) 
                        || itemRaw.match(/"text"\s*:\s*"([\s\S]*?)"/i);
          const expMatch = itemRaw.match(/"explanation"\s*:\s*"([\s\S]*?)"/i);

          if (typeMatch || titleMatch || refMatch) {
            references.push({
              type: (typeMatch ? typeMatch[1] : "quran") as "quran" | "hadith",
              title: titleMatch ? titleMatch[1] : "",
              reference: refMatch ? refMatch[1] : "",
              text: textMatch ? textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim() : "",
              explanation: expMatch ? expMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim() : ""
            });
          }
        }
      }

      return {
        suggestion,
        references,
      };
    }
  }

  // Get Quranic reference suggestion
  static async getQuranReference(query: string, language: "en" | "bn" = "en"): Promise<IReference[]> {
    const suggestion = await this.getIslamicSuggestion({
      prompt: `Find Quranic references related to: ${query}`,
      category: "quran",
      language,
    });

    return suggestion.references;
  }

  // Get Hadith reference suggestion
  static async getHadithReference(query: string, language: "en" | "bn" = "en"): Promise<IReference[]> {
    const suggestion = await this.getIslamicSuggestion({
      prompt: `Find Hadith references related to: ${query}`,
      category: "hadith",
      language,
    });

    return suggestion.references;
  }
}
