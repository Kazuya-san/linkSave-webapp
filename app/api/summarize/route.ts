import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildArticleInsert,
  buildSummarizationPrompt,
  parseSummaryResponse,
} from "@/lib/articles/service";
import type { ArticleDraftInput } from "@/lib/articles/types";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";

const model = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview";

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeArticleDraftPayload(payload: unknown): ArticleDraftInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const sourceUrl = safeString((payload as Record<string, unknown>).sourceUrl);
  const title = safeString((payload as Record<string, unknown>).title);
  const author = safeString((payload as Record<string, unknown>).author);
  const content = safeString((payload as Record<string, unknown>).content);
  const excerpt = safeString((payload as Record<string, unknown>).excerpt);
  const publishedAt = safeString(
    (payload as Record<string, unknown>).publishedAt,
  );
  const siteName = safeString((payload as Record<string, unknown>).siteName);
  const language = safeString((payload as Record<string, unknown>).language);

  if (!sourceUrl) {
    throw new Error("A source URL is required.");
  }

  try {
    new URL(sourceUrl);
  } catch {
    throw new Error("Source URL must be a valid absolute URL.");
  }

  if (content.length < 20) {
    throw new Error("Paste at least 20 characters of article content.");
  }

  if (publishedAt) {
    const date = new Date(publishedAt);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Published date must be a valid date string.");
    }
  }

  return {
    sourceUrl,
    title,
    author,
    content,
    excerpt,
    publishedAt,
    siteName,
    language,
  };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = normalizeArticleDraftPayload(await req.json());
    const supabase = await createClerkSupabaseClientSsr();

    // const { data: existingArticle, error: existingArticleError } =
    //   await supabase
    //     .from("saved_links")
    //     .select("*")
    //     .eq("user_id", userId)
    //     .eq("url", input.sourceUrl)
    //     .limit(1)
    //     .maybeSingle();

    // if (existingArticleError) {
    //   throw existingArticleError;
    // }

    // if (existingArticle) {
    //   return NextResponse.json({
    //     article: existingArticle,
    //     duplicate: true,
    //   });
    // }

    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model,
      contents: buildSummarizationPrompt(input),
    });
    const summary = parseSummaryResponse(result.text ?? "");

    const { data: article, error: insertError } = await supabase
      .from("saved_links")
      .insert(buildArticleInsert(userId, input, summary))
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }
    console.log(article, summary);
    return NextResponse.json({ article, summary });
  } catch (error) {
    console.log("ERRROR", error);
    console.error("Error summarizing article:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error processing the request.",
      },
      { status: 500 },
    );
  }
}
