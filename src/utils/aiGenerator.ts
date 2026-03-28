import { Deck } from "@/store/store";
import { parse } from "papaparse"; // Or any specific parser if needed, but we'll ask AI to return JSON.

const SYSTEM_PROMPT = `
You are an expert educational assistant. Your task is to generate a set of study questions (flashcards or multiple-choice quizzes).

IMPORTANT RULES:
1. READ THE USER'S INPUT CAREFULLY. If the user's input is a request or instruction (e.g., "Create 5 english questions for beginners", "中1レベルの英語の問題を作って"), you MUST follow that instruction and generate the questions accordingly.
2. If the user's input is an informative text or summary, extract the key information from it and create questions based on that text.
3. You MUST generate all questions, answers, options, and explanations in fluent Japanese (日本語) unless the user explicitly asks for another language.
4. Even if the input text is in English or another language, the output MUST be translated and explained in Japanese (unless it's an English language test where English is expected).
5. You MUST output valid JSON only, without any markdown formatting like \`\`\`json. 

The format should strictly be an array of objects matching this structure:
[
  {
    "question": "問題文をここに書く",
    "answer": "正解をここに書く",
    "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"], // Include the answer in options. Leave empty if generating pure flashcards.
    "explanation": "正解の理由や解説（オプション）"
  }
]

Generate at least 5 meaningful questions. If the text is short, generate as many as reasonably possible.
`;

async function extractTextFromImage(base64Image: string, apiKey: string): Promise<string> {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groqの最新Llama4マルチモーダルモデル
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "画像内のテキストをすべて正確に抽出してください。解説やマークダウンは不要です。可能な限りそのままの言語で文字起こししてください。",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Vision API Error: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || "";
}


export async function generateDeckWithGroq(
  text: string,
  apiKey: string,
  deckName: string = "AI Generated Deck",
  mode: "flashcard" | "quiz" = "flashcard",
  imageBase64?: string
): Promise<Deck> {
  if (!apiKey) {
    throw new Error("Groq API Key is missing.");
  }

  let finalText = text;
  if (imageBase64) {
    const extractedText = await extractTextFromImage(imageBase64, apiKey);
    finalText = `[ユーザーの指示・文脈]:\n${text || "以下のテキストから問題を作成してください"}\n\n[画像から抽出されたテキスト]:\n${extractedText}`;
  }

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b", // OpenAIの最新オープンモデル(Groq配信)に変更
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please create a ${mode} deck based on the following text: \n\n${finalText}` },
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON structure
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`API Error: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    // Attempt to parse JSON. Sometimes LLMs output markdown around JSON even when instructed not to.
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedQuestions = JSON.parse(cleanContent);

    if (!Array.isArray(parsedQuestions)) {
      throw new Error("API did not return an array of questions.");
    }

    const deck: Deck = {
      id: crypto.randomUUID(),
      name: deckName,
      mode: mode,
      questions: parsedQuestions.map((q: any) => ({
        id: crypto.randomUUID(),
        question: q.question || "Untitled Question",
        answer: q.answer || "",
        options: Array.isArray(q.options) ? q.options : [],
        explanation: q.explanation || "",
      })),
    };

    return deck;
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse the AI-generated questions. Please try again.");
  }
}
