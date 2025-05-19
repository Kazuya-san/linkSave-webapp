import { GoogleGenAI } from "@google/genai";
import { verifyToken } from "@clerk/nextjs/server";
import { tryCatch } from "@/utils/tryCatch";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized: No token", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await tryCatch(
      verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
    );

    if (error && data === null) {
      return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const { sub: userId } = data;

    const { content } = await req.json();

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
            You are an intelligent content analyzer.

            Given a plain text input from a webpage (usually an article, blog post, or document), your task is to extract a concise summary and relevant metadata in a structured JSON format.

            Please return your response in the following JSON schema:

            {
                "title": "<Extracted or inferred title. Leave empty if not available>",
                "author": "<Extracted author name, if available>",
                "publication_date": "<Extracted or inferred publication date in ISO 8601 format, leave empty if unknown>",
                "summary": "<Concise summary in 3–5 sentences>",
                "tags": ["<Relevant>", "<keywords>", "<and>", "<topics>"],
                "key_points": ["<Main point 1>", "<Main point 2>", "..."],
                "tone": "<neutral | informative | persuasive | emotional | etc.>",
                "read_time_minutes": <Estimated reading time as an integer>,
                "language": "<Detected language code, e.g., 'en', 'es'>",
                "sentiment": "<positive | neutral | negative>",
                "named_entities": ["<Company>", "<Person>", "<Location>", "..."],
                "quotes": ["<Notable quote or statement 1>", "<Quote 2>", "..."],
                "url": "<Original content URL>"
            }

            The input content will be wrapped in triple quotes like this:

            ${JSON.stringify(content)}
          `,
    });

    const textResponse = result.text ?? "";
    const cleaned = textResponse.replace(/```(?:json)?/g, "").trim();

    return new Response(cleaned, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Error processing the request", { status: 500 });
  }
}
