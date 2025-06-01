import { type ChatMessage } from "@shared/schema";

interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string = "gpt-4",
    temperature: number = 0.3,
    instructions?: string
  ): Promise<string> {
    try {
      const openAIMessages: OpenAIMessage[] = [];

      // Add system instructions if provided
      if (instructions) {
        openAIMessages.push({
          role: "system",
          content: instructions
        });
      }

      // Convert chat messages to OpenAI format
      messages.forEach(msg => {
        openAIMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content
        });
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model === "gpt-4" ? "gpt-4" : "gpt-3.5-turbo",
          messages: openAIMessages,
          temperature: temperature / 100, // Convert from 0-100 to 0-1 scale
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";
      
    } catch (error) {
      console.error("AI Service Error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          throw new Error("Invalid API key. Please check your OpenAI API key configuration.");
        }
        if (error.message.includes("429")) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (error.message.includes("quota")) {
          throw new Error("API quota exceeded. Please check your OpenAI account.");
        }
      }
      
      throw new Error("Failed to generate AI response. Please try again.");
    }
  }
}

// Create singleton instance
export const aiService = new AIService(process.env.OPENAI_API_KEY || "");