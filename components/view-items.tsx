import type { ReactNode } from "react";
import { ExternalLink, Quote, Tags } from "lucide-react";

import { formatArticleDate } from "@/lib/articles/service";
import type { ArticleRecord } from "@/lib/articles/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/6 bg-white/3 p-6">
      <p className="text-xs text-zinc-500">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DynamicDataCard({ data }: { data: ArticleRecord }) {
  return (
    <article className="glass-panel overflow-hidden rounded-2xl p-8 sm:p-10">
      <div className="flex flex-col gap-8 border-b border-white/6 pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">Saved brief</p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50 sm:text-5xl">
            {data.title || "Untitled brief"}
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-300 sm:text-lg">
            {data.summary || data.excerpt || "No summary available."}
          </p>
        </div>

        <div className="grid min-w-[18rem] gap-4 rounded-xl border border-white/6 bg-white/3 p-5 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs text-zinc-500">Author</p>
            <p className="mt-2 font-medium text-zinc-100">
              {data.author || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Published</p>
            <p className="mt-2 font-medium text-zinc-100">
              {formatArticleDate(data.publication_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Read time</p>
            <p className="mt-2 font-medium text-zinc-100">
              {data.read_time_minutes ?? 0} min
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Language</p>
            <p className="mt-2 font-medium uppercase text-zinc-100">
              {data.language || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {(data.key_points ?? []).length > 0 ? (
            <Section title="Key points">
              <ol className="space-y-3">
                {(data.key_points ?? []).map((point, index) => (
                  <li
                    key={`${point}-${index}`}
                    className="flex gap-3 text-zinc-300"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-sm font-semibold text-teal-200">
                      {index + 1}
                    </span>
                    <span className="leading-7">{point}</span>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          {data.content ? (
            <Section title="Source content">
              <div className="max-h-[34rem] overflow-y-auto pr-2 text-sm leading-7 text-zinc-300">
                <p className="whitespace-pre-line">{data.content}</p>
              </div>
            </Section>
          ) : null}
        </div>

        <div className="space-y-6">
          {(data.tags ?? []).length > 0 ? (
            <Section title="Topics">
              <div className="flex flex-wrap gap-2">
                {(data.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-400/10 px-3 py-2 text-sm font-medium text-teal-200"
                  >
                    <Tags className="h-4 w-4" />
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {(data.named_entities ?? []).length > 0 ? (
            <Section title="Named entities">
              <div className="flex flex-wrap gap-2">
                {(data.named_entities ?? []).map((entity) => (
                  <span
                    key={entity}
                    className="rounded-lg bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm font-medium text-zinc-300 ring-1 ring-white/8"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {(data.quotes ?? []).length > 0 ? (
            <Section title="Notable quotes">
              <div className="space-y-3">
                {(data.quotes ?? []).map((quote, index) => (
                  <blockquote
                    key={`${quote}-${index}`}
                    className="rounded-xl bg-[rgba(255,255,255,0.04)] px-4 py-4 text-sm italic leading-7 text-zinc-300 ring-1 ring-white/8"
                  >
                    <div className="flex gap-3">
                      <Quote className="mt-1 h-4 w-4 shrink-0 text-teal-300" />
                      <span>{quote}</span>
                    </div>
                  </blockquote>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Source">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-100 underline-offset-4 hover:underline"
            >
              Open original article
              <ExternalLink className="h-4 w-4" />
            </a>
          </Section>
        </div>
      </div>
    </article>
  );
}
