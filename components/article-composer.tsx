"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";

import { createArticleAction } from "@/app/actions/articles";
import type { ArticleDraftInput, ArticleRecord } from "@/lib/articles/types";

type SaveState = {
  status: "idle" | "success" | "error";
  message: string;
  article?: ArticleRecord;
  duplicate?: boolean;
};

const initialForm: ArticleDraftInput = {
  sourceUrl: "",
  title: "",
  author: "",
  content: "",
  excerpt: "",
  publishedAt: "",
  siteName: "",
  language: "en",
};

function getDraftMetrics(content: string) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return {
    words,
    estimatedMinutes: Math.max(1, Math.round(words / 220) || 1),
  };
}

export function ArticleComposer({
  onSaved,
}: {
  onSaved?: (article: ArticleRecord, duplicate: boolean) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ArticleDraftInput>(initialForm);
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deferredContent = useDeferredValue(draft.content);
  const metrics = getDraftMetrics(deferredContent);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState({ status: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const payload = await createArticleAction(draft);

      setSaveState({
        status: "success",
        message: payload.duplicate
          ? "This article was already saved. Open the existing brief below."
          : "Article summarized and added to your library.",
        article: payload.article,
        duplicate: payload.duplicate,
      });

      if (!payload.duplicate) {
        setDraft(initialForm);
      }

      await onSaved?.(payload.article, payload.duplicate);
    } catch (error) {
      setSaveState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save this article.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof ArticleDraftInput>(
    key: Key,
    value: ArticleDraftInput[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <section className="rounded-2xl border border-white/6 bg-transparent">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Source URL</span>
            <input
              required
              type="url"
              value={draft.sourceUrl}
              onChange={(event) => updateField("sourceUrl", event.target.value)}
              placeholder="https://example.com/article"
              className="field-input"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Optional title override"
              className="field-input"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Author</span>
            <input
              type="text"
              value={draft.author}
              onChange={(event) => updateField("author", event.target.value)}
              placeholder="Author or publication"
              className="field-input"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">
              Published date
            </span>
            <input
              type="date"
              value={draft.publishedAt}
              onChange={(event) =>
                updateField("publishedAt", event.target.value)
              }
              className="field-input"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Excerpt</span>
          <textarea
            rows={3}
            value={draft.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Optional excerpt used as a preview in the library."
            className="field-input min-h-24 resize-y"
          />
        </label>

        <label className="space-y-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-200">
            <span>Article content</span>
            <span className="text-xs font-normal text-zinc-500">
              {metrics.words} words / about {metrics.estimatedMinutes} min
            </span>
          </span>
          <textarea
            required
            rows={12}
            value={draft.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="Paste the article text here. The app will summarize it and save a structured brief."
            className="field-input min-h-[18rem] resize-y"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-zinc-400">
            The original article text is stored so the detail view can preserve
            context, quotes, and future analysis.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(20,184,166,0.18)] transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving brief
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate summary
              </>
            )}
          </button>
        </div>
      </form>

      {saveState.status !== "idle" ? (
        <div
          className={`mt-6 rounded-xl border px-5 py-4 ${
            saveState.status === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/20 bg-rose-400/10 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {saveState.status === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium">{saveState.message}</p>
              {saveState.article ? (
                <Link
                  href={`/view/${saveState.article.id}`}
                  className="inline-flex text-sm font-medium underline-offset-4 hover:underline"
                >
                  Open saved brief
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
