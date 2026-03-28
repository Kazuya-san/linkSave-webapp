import Link from "next/link";
import { ArrowUpRight, Clock3, Sparkles, Tag } from "lucide-react";

import {
  formatArticleDate,
  formatRelativeArticleDate,
} from "@/lib/articles/service";
import type { ArticleRecord } from "@/lib/articles/types";

export function ArticleCard({ article }: { article: ArticleRecord }) {
  return (
    <Link href={`/view/${article.id}`} className="group block">
      <article className="glass-panel relative h-full overflow-hidden rounded-xl p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-400/30 hover:shadow-[0_26px_60px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_72%)]" />
        <div className="relative flex min-w-0 h-full flex-col">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs text-zinc-500">
              {formatRelativeArticleDate(article.created_at)}
            </p>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-100" />
          </div>

          <h3 className="mt-5 text-2xl font-semibold text-zinc-50">
            {article.title || "Untitled brief"}
          </h3>

          <p className="mt-3 line-clamp-4 text-sm leading-7 text-zinc-400">
            {article.summary || article.excerpt || "No summary available yet."}
          </p>

          <div className="mt-5 flex min-w-0 flex-wrap gap-2">
            {(article.tags ?? []).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-400/10 px-3 py-1.5 text-xs font-medium text-teal-200"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-white/6 bg-white/3 p-4 text-sm text-zinc-400 sm:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-500">Author</p>
              <p className="mt-2 font-medium text-zinc-100">
                {article.author || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Published</p>
              <p className="mt-2 font-medium text-zinc-100">
                {formatArticleDate(article.publication_date)}
              </p>
            </div>
          </div>

          <div className="mt-auto flex min-w-0 flex-col gap-3 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {article.read_time_minutes ?? 0} min read
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {(article.key_points ?? []).length} key points
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
