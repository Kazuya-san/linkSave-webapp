import { BookOpen, SearchSlash } from "lucide-react";

import { ArticleCard } from "@/components/article-card";
import type { ArticleRecord } from "@/lib/articles/types";

type ArticlesViewProps = {
  articles: ArticleRecord[];
  searchTerms: string[];
};

export default function ArticlesView({
  articles,
  searchTerms,
}: ArticlesViewProps) {
  return (
    <section className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Library</p>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-50">
            Saved briefs
          </h2>
        </div>
        {searchTerms.length > 0 ? (
          <p className="text-sm text-zinc-500">
            Matching{" "}
            <span className="font-medium text-zinc-200">
              {searchTerms.join(", ")}
            </span>
          </p>
        ) : null}
      </div>

      {articles.length > 0 ? (
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
            {searchTerms.length > 0 ? (
              <SearchSlash className="h-8 w-8" />
            ) : (
              <BookOpen className="h-8 w-8" />
            )}
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-zinc-50">
            {searchTerms.length > 0
              ? "No briefs match those filters"
              : "Your library is empty"}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400">
            {searchTerms.length > 0
              ? "Try fewer filters or broader themes so more saved articles appear."
              : "Paste your first article into the composer above and LinkSave will turn it into a clean, searchable brief."}
          </p>
        </div>
      )}
    </section>
  );
}
