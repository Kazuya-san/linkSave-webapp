import { GoogleGenAI } from "@google/genai";
import { verifyToken } from "@clerk/nextjs/server";
import { tryCatch } from "@/utils/tryCatch";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";

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

    const { content } = (await req.json()) as {
      content: {
        url: string;
        title: string | null | undefined;
        content: string;
        textContent: string | null | undefined;
        length: number | null | undefined;
        excerpt: string | null | undefined;
        byline: string | null | undefined;
        dir: string | null | undefined;
        siteName: string | null | undefined;
        lang: string | null | undefined;
        publishedTime: string | null | undefined;
      };
    };

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
                "quotes": ["<Notable quotes that listed or ones you infer or statement 1>", "<Quote 2>", "..."],
                "url": "<Original content URL>"
            }

            The input content will be wrapped in triple quotes like this:

            ${JSON.stringify(content)}
          `,
    });

    const textResponse = result.text ?? "";
    const cleaned = textResponse.replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const client = await createClerkSupabaseClientSsr();
    const supabaseData = {
      user_id: userId,
      url: content.url,
      title: parsed.title || content.title,
      author: content.byline, // 'byline' mapped to 'author'
      publication_date: content.publishedTime, // mapped from 'published_time'
      content: content.textContent, // 'text_content' mapped to 'content'
      excerpt: content.excerpt,
      direction: content.dir, // 'dir' mapped to 'direction'
      content_length: content.textContent?.length || 0, // simple content length in characters
      summary: parsed.summary,
      tags: parsed.tags,
      key_points: parsed.key_points,
      read_time_minutes: parsed.read_time_minutes,
      tone: parsed.tone,
      sentiment: parsed.sentiment,
      named_entities: parsed.named_entities,
      quotes: parsed.quotes,
      language: content.lang,
      // Optional: `created_at` is auto-set in DB; no need to send
    };

    const res = await client.from("saved_links").insert(supabaseData);

    console.log("Supabase response:", res);
    console.log("Parsed response:", parsed);
    console.log(supabaseData, "supabaseData");

    return new Response(cleaned, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Error processing the request", { status: 500 });
  }
}
