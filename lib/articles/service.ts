import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ArticleCollectionStats,
  ArticleDraftInput,
  ArticleRecord,
  ArticleSummaryResult,
} from "@/lib/articles/types";

const MAX_ITEMS = 200;

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function splitList(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((term) => term.trim())
      .filter(Boolean) ?? []
  );
}

function safeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return unique(
    value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean),
  );
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function countFreshArticles(articles: ArticleRecord[]) {
  const now = new Date();

  return articles.filter((article) => {
    if (!article.created_at) {
      return false;
    }

    const createdAt = new Date(article.created_at);

    return (
      createdAt.getUTCFullYear() === now.getUTCFullYear() &&
      createdAt.getUTCMonth() === now.getUTCMonth()
    );
  }).length;
}

export function parseSearchTerms(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return unique(value.flatMap(splitList));
  }

  return unique(splitList(value));
}

export function filterArticles(
  articles: ArticleRecord[],
  searchTerms: string[],
) {
  if (!searchTerms.length) {
    return articles;
  }

  const normalizedTerms = searchTerms.map((term) => term.toLowerCase());

  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.summary,
      article.author,
      article.url,
      article.excerpt,
      article.language,
      article.tone,
      article.sentiment,
      ...(article.tags ?? []),
      ...(article.key_points ?? []),
      ...(article.named_entities ?? []),
    ]
      .map(normalizeText)
      .join(" ");

    return normalizedTerms.every((term) => haystack.includes(term));
  });
}

export function getFeaturedTopics(articles: ArticleRecord[], limit = 6) {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const topic of article.tags ?? []) {
      const normalizedTopic = topic.trim();

      if (!normalizedTopic) {
        continue;
      }

      counts.set(normalizedTopic, (counts.get(normalizedTopic) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([topic]) => topic);
}

export function getCollectionStats(
  allArticles: ArticleRecord[],
  visibleArticles: ArticleRecord[],
): ArticleCollectionStats {
  const totalMinutes = allArticles.reduce(
    (sum, article) => sum + (article.read_time_minutes ?? 0),
    0,
  );
  const topicCount = new Set(
    allArticles.flatMap((article) => article.tags ?? []),
  ).size;

  return {
    totalArticles: allArticles.length,
    visibleArticles: visibleArticles.length,
    estimatedReadingHours:
      Math.round((totalMinutes / 60 + Number.EPSILON) * 10) / 10,
    freshThisMonth: countFreshArticles(allArticles),
    topicCount,
  };
}

export function formatArticleDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeArticleDate(value: string | null) {
  if (!value) {
    return "Saved recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const days = Math.round(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (Math.abs(days) < 30) {
    return formatter.format(days, "day");
  }

  const months = Math.round(days / 30);
  return formatter.format(months, "month");
}

export async function listUserArticles(
  client: SupabaseClient,
  userId: string,
  termQuery?: string | string[],
) {
  const { data, error } = await client
    .from("saved_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_ITEMS);

  if (error) {
    throw error;
  }

  const allArticles = (data ?? []) as ArticleRecord[];
  const searchTerms = parseSearchTerms(termQuery);
  const filteredArticles = filterArticles(allArticles, searchTerms);

  return {
    allArticles,
    filteredArticles,
    featuredTopics: getFeaturedTopics(allArticles),
    searchTerms,
    stats: getCollectionStats(allArticles, filteredArticles),
  };
}

export async function findUserArticle(
  client: SupabaseClient,
  userId: string,
  articleId: string,
) {
  const { data, error } = await client
    .from("saved_links")
    .select("*")
    .eq("user_id", userId)
    .eq("id", articleId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ArticleRecord | null;
}

export function normalizeArticleDraftPayload(
  payload: unknown,
): ArticleDraftInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const sourceUrl =
    safeString(
      (payload as Record<string, unknown>).sourceUrl ??
        (payload as Record<string, unknown>).url,
    ) || "about:blank";

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

  // try {
  //   new URL(sourceUrl);
  // } catch {
  //   throw new Error("Source URL must be a valid absolute URL.");
  // }

  if (content.length < 120) {
    throw new Error("Paste at least 120 characters of article content.");
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

export function buildSummarizationPrompt(input: ArticleDraftInput) {
  return `
You are an expert editorial research assistant.

Analyze the article payload below and return exactly one JSON object that matches this schema:

{
  "title": "string",
  "author": "string",
  "publication_date": "ISO 8601 date string or empty string",
  "summary": "3 to 5 crisp sentences",
  "tags": ["string"],
  "key_points": ["string"],
  "tone": "string",
  "read_time_minutes": 0,
  "language": "BCP-47 or ISO language code",
  "sentiment": "positive | neutral | negative | mixed",
  "named_entities": ["string"],
  "quotes": ["string"],
  "url": "string"
}

Rules:
- Respond with valid JSON only.
- Keep tags to 3 to 6 concise topics.
- Keep key_points to 3 to 5 sharp bullets as plain strings.
- Use empty strings instead of null.
- Preserve the source URL exactly.

Article payload:
${JSON.stringify(input, null, 2)}
  `.trim();
}

export function parseSummaryResponse(value: string): ArticleSummaryResult {
  const cleaned = value.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    title: safeString(parsed.title),
    author: safeString(parsed.author),
    publication_date: safeString(parsed.publication_date),
    summary: safeString(parsed.summary),
    tags: safeStringArray(parsed.tags),
    key_points: safeStringArray(parsed.key_points),
    tone: safeString(parsed.tone, "informative"),
    read_time_minutes: Math.max(1, safeNumber(parsed.read_time_minutes, 3)),
    language: safeString(parsed.language, "en"),
    sentiment: safeString(parsed.sentiment, "neutral"),
    named_entities: safeStringArray(parsed.named_entities),
    quotes: safeStringArray(parsed.quotes),
    url: safeString(parsed.url),
  };
}

export function buildArticleInsert(
  userId: string,
  input: ArticleDraftInput,
  summary: ArticleSummaryResult,
) {
  return {
    user_id: userId,
    url: input.sourceUrl,
    title: summary.title || input.title || "Untitled brief",
    author: summary.author || input.author || "Unknown",
    publication_date: summary.publication_date || input.publishedAt || null,
    content: input.content,
    excerpt:
      input.excerpt || input.content.replace(/\s+/g, " ").trim().slice(0, 240),
    direction: "ltr",
    content_length: input.content.length,
    summary: summary.summary,
    tags: summary.tags,
    key_points: summary.key_points,
    read_time_minutes: summary.read_time_minutes,
    tone: summary.tone,
    sentiment: summary.sentiment,
    named_entities: summary.named_entities,
    quotes: summary.quotes,
    language: summary.language || input.language || "en",
  };
}
