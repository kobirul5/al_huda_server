# Islamic AI Module (Al Huda)

This module provides AI-powered Islamic suggestions with Quranic and Hadith references using OpenRouter API.

## Overview

The AI module uses the OpenRouter AI service to generate Islamic suggestions and retrieve relevant references from the Quran and Hadith. It's designed to:

- Provide Islamic guidance on user queries
- Return relevant Quranic verses with references
- Fetch Hadith references
- Support multiple languages (English and Bengali)

## Features

✅ **Islamic Suggestions** - Get Islamic guidance with Quran and Hadith references  
✅ **Quran References** - Retrieve specific Quranic verses related to queries  
✅ **Hadith References** - Get relevant Hadith with proper references  
✅ **Multi-language Support** - English and Bengali support  
✅ **OpenRouter Integration** - Uses free models for cost-effective AI  

## API Endpoints

### 1. Get Islamic Suggestion

**POST** `/ai/suggestion`

Returns Islamic guidance with Quran and Hadith references.

**Request Body:**
```json
{
  "prompt": "How to handle anger in Islam?",
  "category": "general",
  "language": "en"
}
```

**Parameters:**
- `prompt` (string, required): The user's question or topic
- `category` (string, optional): One of `"quran"`, `"hadith"`, or `"general"` (default: "general")
- `language` (string, optional): One of `"en"` or `"bn"` (default: "en")

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Islamic suggestion retrieved successfully",
  "data": {
    "prompt": "How to handle anger in Islam?",
    "suggestion": "In Islam, controlling anger is highly encouraged...",
    "references": [
      {
        "type": "quran",
        "title": "Surah Al-Imran",
        "reference": "Al-Imran 3:134",
        "text": "Those who restrain their anger and forgive people...",
        "explanation": "This verse emphasizes the importance of controlling anger"
      },
      {
        "type": "hadith",
        "title": "Sunan Ibn Majah",
        "reference": "Ibn Majah 4186",
        "text": "Strong is not the one who throws people down in wrestling...",
        "explanation": "The Prophet (PBUH) defines true strength as self-control"
      }
    ],
    "category": "general",
    "createdAt": "2024-05-18T12:34:56.000Z"
  }
}
```

### 2. Get Quran References

**POST** `/ai/quran-references`

Get specific Quranic references for a query.

**Request Body:**
```json
{
  "query": "patience in adversity",
  "language": "en"
}
```

**Parameters:**
- `query` (string, required): The topic to search for
- `language` (string, optional): One of `"en"` or `"bn"` (default: "en")

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Quranic references retrieved successfully",
  "data": [
    {
      "type": "quran",
      "title": "Surah Al-Baqarah",
      "reference": "Al-Baqarah 2:155-157",
      "text": "And We will surely test you with something of fear and hunger...",
      "explanation": "Allah promises to test believers and mentions rewards for patience"
    }
  ]
}
```

### 3. Get Hadith References

**POST** `/ai/hadith-references`

Get specific Hadith references for a query.

**Request Body:**
```json
{
  "query": "kindness to parents",
  "language": "en"
}
```

**Parameters:**
- `query` (string, required): The topic to search for
- `language` (string, optional): One of `"en"` or `"bn"` (default: "en")

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Hadith references retrieved successfully",
  "data": [
    {
      "type": "hadith",
      "title": "Sahih Bukhari",
      "reference": "Sahih Bukhari 5971",
      "text": "The Prophet (PBUH) said: Your duty is to be kind to your parents...",
      "explanation": "The Prophet emphasizes the importance of treating parents with kindness"
    }
  ]
}
```

## Frontend Integration

### Example: React Component

```typescript
import { useState } from "react";
import axios from "axios";

interface AISuggestion {
  prompt: string;
  suggestion: string;
  references: Array<{
    type: "quran" | "hadith";
    title: string;
    reference: string;
    text: string;
    explanation?: string;
  }>;
}

export function IslamicAIScroller() {
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai/suggestion", {
        prompt,
        category: "general",
        language: "en",
      });
      setSuggestion(response.data.data);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask an Islamic question..."
      />
      <button onClick={handleGetSuggestion} disabled={loading}>
        {loading ? "Loading..." : "Get Suggestion"}
      </button>

      {suggestion && (
        <div>
          <h3>Suggestion</h3>
          <p>{suggestion.suggestion}</p>

          <h3>References</h3>
          {suggestion.references.map((ref, idx) => (
            <div key={idx}>
              <strong>{ref.title}</strong> ({ref.reference})
              <p>{ref.text}</p>
              {ref.explanation && <p className="text-sm">{ref.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Environment Setup

Make sure these environment variables are set in `.env`:

```env
OPEN_ROUTER_API_KEY=sk-or-v1-xxxxxx
```

The API key should have OpenRouter API access. You can get it from [openrouter.ai](https://openrouter.ai)

## File Structure

```
src/app/modules/AI/
├── ai.interface.ts    # TypeScript interfaces
├── ai.service.ts      # Business logic and OpenRouter integration
├── ai.controller.ts   # Request handlers
└── ai.route.ts        # Route definitions
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description"
}
```

## Notes

- The module uses the free Mistral 7B model from OpenRouter for cost efficiency
- Responses are cached and formatted to return structured JSON
- All user prompts should be validated on the frontend before sending
- The AI is role-based to ensure Islamic authenticity

## Future Enhancements

- [ ] Add user authentication to save favorite suggestions
- [ ] Implement caching to reduce API calls
- [ ] Add support for more languages
- [ ] Store suggestion history in database
- [ ] Add rating/feedback system for suggestions
