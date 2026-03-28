import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-5 py-12">
      <div className="glass-panel rounded-2xl p-10 text-center">
        <p className="eyebrow">Missing page</p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
          That brief could not be found.
        </h1>
        <p className="mt-4 text-base leading-8 text-zinc-300">
          The link may be outdated, or the article might not belong to the
          current account.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
