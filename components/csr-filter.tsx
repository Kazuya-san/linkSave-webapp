"use client";

import { type ReactNode, useDeferredValue, useEffect, useState } from "react";
import {
  Filter as FilterIcon,
  Globe2,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { parseSearchTerms } from "@/lib/articles/service";

type FilterFacet = {
  value: string;
  count: number;
};

type FilterProps = {
  initialTerms: string[];
  totalArticles: number;
  visibleArticles: number;
  topicFacets: FilterFacet[];
  authorFacets: FilterFacet[];
  languageFacets: FilterFacet[];
  isLoading?: boolean;
  onApply: (terms: string[]) => void | Promise<void>;
};

function areTermsEqual(left: string[], right: string[]) {
  return left.join("|") === right.join("|");
}

function FacetSection({
  title,
  icon,
  facets,
  activeTerms,
  onToggle,
}: {
  title: string;
  icon: ReactNode;
  facets: FilterFacet[];
  activeTerms: string[];
  onToggle: (value: string) => void;
}) {
  if (!facets.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2">
        {facets.map((facet) => {
          const isActive = activeTerms.includes(facet.value);

          return (
            <button
              key={facet.value}
              type="button"
              onClick={() => onToggle(facet.value)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "border-teal-400/30 bg-teal-400/10 text-teal-200"
                  : "border-white/8 bg-[rgba(255,255,255,0.03)] text-zinc-300 hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              <span className="truncate pr-3">{facet.value}</span>
              <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs text-zinc-400">
                {facet.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const Filter = ({
  initialTerms,
  totalArticles,
  visibleArticles,
  topicFacets,
  authorFacets,
  languageFacets,
  isLoading = false,
  onApply,
}: FilterProps) => {
  const [inputValue, setInputValue] = useState(initialTerms.join(", "));
  const deferredInput = useDeferredValue(inputValue);
  const activeDraftTerms = parseSearchTerms(deferredInput);
  const appliedTerms = parseSearchTerms(initialTerms);

  useEffect(() => {
    setInputValue(initialTerms.join(", "));
  }, [initialTerms]);

  const hasPendingChanges = !areTermsEqual(activeDraftTerms, appliedTerms);

  const applyFilters = (nextTerms = activeDraftTerms) => {
    void onApply(nextTerms);
  };

  const clearAll = () => {
    setInputValue("");
    applyFilters([]);
  };

  const removeAppliedTerm = (value: string) => {
    const nextTerms = appliedTerms.filter((term) => term !== value);
    setInputValue(nextTerms.join(", "));
    applyFilters(nextTerms);
  };

  const toggleTerm = (value: string) => {
    const sourceTerms = appliedTerms.includes(value)
      ? appliedTerms.filter((term) => term !== value)
      : [...appliedTerms, value];

    setInputValue(sourceTerms.join(", "));
    applyFilters(sourceTerms);
  };

  return (
    <div className="glass-panel animate-enter overflow-hidden rounded-2xl p-5 [animation-delay:240ms]">
      <div className="border-b border-white/6 pb-5">
        <p className="eyebrow">Filter rail</p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-50">
          Refine results fast
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Search once, then layer quick filters without losing your place in the
          results.
        </p>
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <div className="relative">
          {/* <Search className="field-input-icon h-4 w-4" /> */}
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="AI, fintech, OpenAI, leadership"
            className="field-input h-12 pl-12 pr-11"
          />
          {inputValue ? (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={isLoading || !hasPendingChanges}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(20,184,166,0.18)] transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FilterIcon className="h-4 w-4" />
            {isLoading ? "Applying" : "Apply"}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-[rgba(18,25,36,0.92)] px-4 py-3 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 transition hover:bg-[rgba(24,32,45,0.96)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-5 rounded-xl border border-white/6 bg-[rgba(255,255,255,0.03)] p-4">
        <p className="text-xs text-zinc-500">Current result set</p>
        <p className="mt-2 text-lg font-semibold text-zinc-100">
          {visibleArticles} of {totalArticles} briefs
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {appliedTerms.length > 0
            ? `${appliedTerms.length} active filter terms`
            : "No active filters applied"}
        </p>
        {hasPendingChanges ? (
          <p className="mt-2 text-xs text-amber-300">
            Draft changes are ready to apply
          </p>
        ) : null}
      </div>

      {appliedTerms.length > 0 ? (
        <section className="mt-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Selected filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {appliedTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => removeAppliedTerm(term)}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-400/10 px-3 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-400/15"
              >
                <span>{term}</span>
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6 space-y-6">
        <FacetSection
          title="Top topics"
          icon={<Sparkles className="h-4 w-4 text-amber-400" />}
          facets={topicFacets}
          activeTerms={appliedTerms}
          onToggle={toggleTerm}
        />
        <FacetSection
          title="Authors"
          icon={<UserRound className="h-4 w-4 text-zinc-400" />}
          facets={authorFacets}
          activeTerms={appliedTerms}
          onToggle={toggleTerm}
        />
        <FacetSection
          title="Languages"
          icon={<Globe2 className="h-4 w-4 text-zinc-400" />}
          facets={languageFacets}
          activeTerms={appliedTerms}
          onToggle={toggleTerm}
        />
      </div>
    </div>
  );
};

export default Filter;
