export interface IAISuggestion {
  id?: string;
  prompt: string;
  suggestion: string;
  references: IReference[];
  category: "quran" | "hadith" | "general";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReference {
  type: "quran" | "hadith";
  title: string;
  reference: string; // e.g., "Surah Al-Baqarah 2:255" or "Sahih Bukhari 3897"
  text: string;
  explanation?: string;
}

export interface IOpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface IIslamicSuggestionRequest {
  prompt: string;
  category?: "quran" | "hadith" | "general";
  language?: "en" | "bn";
}
