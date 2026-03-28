export type ArticleRecord = {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  author: string | null;
  publication_date: string | null;
  content: string | null;
  excerpt: string | null;
  direction: string | null;
  content_length: number | null;
  summary: string | null;
  tags: string[] | null;
  key_points: string[] | null;
  read_time_minutes: number | null;
  tone: string | null;
  sentiment: string | null;
  named_entities: string[] | null;
  quotes: string[] | null;
  language: string | null;
  created_at: string | null;
};

export type ArticleDraftInput = {
  sourceUrl: string;
  title?: string;
  author?: string;
  content: string;
  excerpt?: string;
  publishedAt?: string;
  siteName?: string;
  language?: string;
};

export type ArticleSummaryResult = {
  title: string;
  author: string;
  publication_date: string;
  summary: string;
  tags: string[];
  key_points: string[];
  tone: string;
  read_time_minutes: number;
  language: string;
  sentiment: string;
  named_entities: string[];
  quotes: string[];
  url: string;
};

export type ArticleCollectionStats = {
  totalArticles: number;
  visibleArticles: number;
  estimatedReadingHours: number;
  freshThisMonth: number;
  topicCount: number;
};
