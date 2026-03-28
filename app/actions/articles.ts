"use server";

import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";

import {
  buildArticleInsert,
  buildSummarizationPrompt,
  listUserArticles,
  parseSummaryResponse,
} from "@/lib/articles/service";
import type { ArticleDraftInput, ArticleRecord } from "@/lib/articles/types";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";

type FilterFacet = {
  value: string;
  count: number;
};

function getTopFacetValues(
  values: Array<string | null | undefined>,
  limit = 6,
  minimumCount = 1,
) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      continue;
    }

    counts.set(normalizedValue, (counts.get(normalizedValue) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minimumCount)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([value, count]) => ({
      value,
      count,
    })) as FilterFacet[];
}

function getFilterFacets(articles: ArticleRecord[]) {
  return {
    topics: getTopFacetValues(
      articles.flatMap((article) => article.tags ?? []),
      8,
      1,
    ),
    authors: getTopFacetValues(
      articles.map((article) => article.author),
      6,
      1,
    ),
    languages: getTopFacetValues(
      articles.map((article) => article.language?.toUpperCase()),
      4,
      1,
    ),
  };
}

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

export async function getArticleWorkspaceAction(termQuery?: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClerkSupabaseClientSsr();
  const result = await listUserArticles(supabase, userId, termQuery);

  return {
    items: result.filteredArticles,
    searchTerms: result.searchTerms,
    stats: result.stats,
    filterFacets: getFilterFacets(result.allArticles),
  };
}

export async function createArticleAction(payload: unknown) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const input = normalizeArticleDraftPayload(payload);
  const supabase = await createClerkSupabaseClientSsr();
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const { data: existingArticle, error: existingArticleError } = await supabase
    .from("saved_links")
    .select("*")
    .eq("user_id", userId)
    .eq("url", input.sourceUrl)
    .limit(1)
    .maybeSingle();

  if (existingArticleError) {
    throw existingArticleError;
  }

  if (existingArticle) {
    return {
      article: existingArticle as ArticleRecord,
      duplicate: true,
    };
  }

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

  return {
    article: article as ArticleRecord,
    duplicate: false,
  };
}
