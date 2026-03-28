import { ArrowRight, Blocks, BookmarkPlus, Sparkles } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

const featureCards = [
  {
    title: "Capture signal, not clutter",
    body: "Save long-form writing as clean executive briefs with the summary, themes, entities, and source context already organized.",
    icon: BookmarkPlus,
  },
  {
    title: "Search your own research desk",
    body: "Filter by themes, names, and ideas across your saved reading without bouncing between tools.",
    icon: Blocks,
  },
  {
    title: "Ship faster from better context",
    body: "Turn article fragments into a reusable knowledge base that makes writing, product discovery, and strategy work faster.",
    icon: Sparkles,
  },
];

export function MarketingHome() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-10 lg:px-8 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="glass-panel animate-enter rounded-2xl p-8 lg:p-12">
          <p className="eyebrow">Private knowledge system</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-zinc-50 sm:text-5xl lg:text-6xl">
            Save articles, generate polished briefs, and keep your reading
            stack usable.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            LinkSave turns raw article text into structured, searchable
            summaries so the useful parts of your reading survive long after the
            tab is gone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <SignUpButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(20,184,166,0.18)] transition hover:bg-teal-300"
              >
                Start saving articles
                <ArrowRight className="h-4 w-4" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center rounded-xl bg-[rgba(18,25,36,0.92)] px-5 py-3 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 transition hover:bg-[rgba(24,32,45,0.96)]"
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass-panel animate-enter rounded-2xl p-8 [animation-delay:120ms]">
            <p className="eyebrow">What improves</p>
            <div className="mt-5 space-y-4 text-sm text-zinc-400">
              <p className="flex items-start justify-between gap-4 border-b border-white/6 pb-4">
                <span>Searchable summaries</span>
                <span className="font-medium text-zinc-100">Built in</span>
              </p>
              <p className="flex items-start justify-between gap-4 border-b border-white/6 pb-4">
                <span>Reading-time estimates</span>
                <span className="font-medium text-zinc-100">Automatic</span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span>Topic clustering via tags</span>
                <span className="font-medium text-zinc-100">Structured</span>
              </p>
            </div>
          </div>
          <div className="glass-panel animate-enter rounded-2xl p-8 [animation-delay:220ms]">
            <p className="eyebrow">Built for</p>
            <p className="mt-4 text-lg font-medium text-zinc-100">
              Product teams, researchers, operators, and founders who read a
              lot and hate losing context.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureCards.map(({ title, body, icon: Icon }, index) => (
          <article
            key={title}
            className="glass-panel animate-enter rounded-xl p-6 [animation-delay:320ms]"
            style={{ animationDelay: `${320 + index * 120}ms` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(245,158,11,0.14))] text-teal-200">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-100">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
