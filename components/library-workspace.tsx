"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Plus, Sparkles, X } from "lucide-react";

import { getArticleWorkspaceAction } from "@/app/actions/articles";
import { ArticleComposer } from "@/components/article-composer";
import Filter from "@/components/csr-filter";
import Home from "@/components/ssr-view";
import type { ArticleRecord } from "@/lib/articles/types";

type FilterFacet = {
  value: string;
  count: number;
};

type WorkspaceState = {
  items: ArticleRecord[];
  searchTerms: string[];
  stats: {
    totalArticles: number;
    visibleArticles: number;
    estimatedReadingHours: number;
    freshThisMonth: number;
    topicCount: number;
  };
  filterFacets: {
    topics: FilterFacet[];
    authors: FilterFacet[];
    languages: FilterFacet[];
  };
};

function ModalFrame({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[rgba(4,6,10,0.72)] px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="flex h-full items-start justify-center sm:items-center">
        <div className="glass-panel relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl p-4 sm:max-h-[calc(100dvh-3rem)] sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-xl bg-[rgba(18,25,36,0.92)] p-2 text-zinc-300 ring-1 ring-white/10 transition hover:bg-[rgba(24,32,45,0.96)] sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-5 max-w-2xl shrink-0 pr-10 sm:mb-6">
            <p className="eyebrow">Create article brief</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-50 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{subtitle}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LibraryWorkspace({
  initialState,
}: {
  initialState: WorkspaceState;
}) {
  const [workspace, setWorkspace] = useState(initialState);
  const [isFiltering, startFiltering] = useTransition();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const scrollLockRef = useRef<string>("");

  useEffect(() => {
    setWorkspace(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!isComposerOpen) {
      document.body.style.overflow = scrollLockRef.current;
      return;
    }

    scrollLockRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = scrollLockRef.current;
    };
  }, [isComposerOpen]);

  async function loadWorkspace(nextTerms: string[]) {
    const query = nextTerms.join(",");
    setActionError("");

    startFiltering(async () => {
      try {
        const nextWorkspace = await getArticleWorkspaceAction(query);
        setWorkspace(nextWorkspace);

        if (typeof window !== "undefined") {
          const nextUrl = query
            ? `${window.location.pathname}?terms=${encodeURIComponent(query)}`
            : window.location.pathname;

          window.history.replaceState(null, "", nextUrl);
        }
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Could not load filtered results.",
        );
      }
    });
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 overflow-x-clip px-4 py-8 sm:px-5 sm:py-10 lg:px-8 lg:py-12">
        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="eyebrow">Library</p>
              <h1 className="mt-3 text-4xl font-semibold text-zinc-50 sm:text-5xl">
                Your saved briefs come first.
              </h1>
              <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                Search and refine in place, open briefs without losing context,
                and create new entries only when you need them.
              </p>
            </div>
            <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="min-w-0 rounded-xl border border-white/6 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-zinc-400">
                <p className="text-xs text-zinc-500">Collection health</p>
                <p className="mt-1 break-words font-medium text-zinc-100">
                  {workspace.stats.totalArticles} briefs /{" "}
                  {workspace.stats.topicCount} topics
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(20,184,166,0.18)] transition hover:bg-teal-300"
              >
                <Plus className="h-4 w-4" />
                New article brief
              </button>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[19rem_minmax(0,1fr)] xl:items-start">
          <aside className="xl:sticky xl:top-24">
            <Filter
              initialTerms={workspace.searchTerms}
              totalArticles={workspace.stats.totalArticles}
              visibleArticles={workspace.stats.visibleArticles}
              topicFacets={workspace.filterFacets.topics}
              authorFacets={workspace.filterFacets.authors}
              languageFacets={workspace.filterFacets.languages}
              isLoading={isFiltering}
              onApply={loadWorkspace}
            />
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">Results workspace</p>
                  <h2 className="mt-3 text-3xl font-semibold text-zinc-50">
                    Browse without a full page refresh
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                    Filters run asynchronously and keep the interface stable.
                    Results swap in place with loading feedback instead of
                    forcing a route reload.
                  </p>
                </div>
                <div className="min-w-0 rounded-xl border border-teal-400/12 bg-teal-400/8 px-4 py-3 text-sm text-zinc-300">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-zinc-950 p-2 text-teal-300 ring-1 ring-white/8">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words font-medium text-zinc-100">
                        {workspace.stats.visibleArticles} visible /{" "}
                        {workspace.stats.totalArticles} total
                      </p>
                      <p className="break-words text-zinc-400">
                        {workspace.stats.estimatedReadingHours} reading hours
                        tracked
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {actionError ? (
                <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {actionError}
                </div>
              ) : null}
            </section>

            {isFiltering ? (
              <div className="glass-panel rounded-2xl p-4 sm:p-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/6 bg-[rgba(255,255,255,0.03)] p-6"
                    >
                      <div className="h-4 w-24 animate-pulse rounded bg-white/8" />
                      <div className="mt-4 h-7 w-4/5 animate-pulse rounded bg-white/8" />
                      <div className="mt-3 h-16 animate-pulse rounded bg-white/8" />
                      <div className="mt-5 h-10 animate-pulse rounded bg-white/8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Home
                articles={workspace.items}
                searchTerms={workspace.searchTerms}
              />
            )}
          </div>
        </section>
      </main>

      {isComposerOpen ? (
        <ModalFrame
          title="Save a new article without leaving the library"
          subtitle="The create flow lives in a focused modal now, so the collection stays primary and you only open creation when needed."
          onClose={() => setIsComposerOpen(false)}
        >
          <ArticleComposer
            onSaved={async () => {
              setIsComposerOpen(false);
              await loadWorkspace(workspace.searchTerms);
            }}
          />
        </ModalFrame>
      ) : null}
    </>
  );
}
