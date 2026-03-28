import type { ReactNode } from "react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

function ActionButton({
  children,
  tone = "secondary",
}: {
  children: ReactNode;
  tone?: "primary" | "secondary";
}) {
  const classes =
    tone === "primary"
      ? "bg-teal-400 text-slate-950 shadow-[0_20px_45px_rgba(8,145,178,0.18)] hover:bg-teal-300"
      : "bg-[rgba(18,25,36,0.92)] text-zinc-100 ring-1 ring-white/10 hover:bg-[rgba(24,32,45,0.96)]";

  return (
    <span
      className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${classes}`}
    >
      {children}
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(9,13,18,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-lg font-semibold text-white shadow-[0_16px_34px_rgba(15,118,110,0.25)]">
            LS
          </span>
          <div>
            <p className="text-xs text-zinc-500">
              Editorial OS
            </p>
            <p className="text-lg font-semibold text-zinc-50">LinkSave</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button">
                <ActionButton>Sign in</ActionButton>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button">
                <ActionButton tone="primary">Create account</ActionButton>
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="hidden rounded-xl bg-[rgba(18,25,36,0.92)] px-4 py-2 text-sm text-zinc-400 ring-1 ring-white/8 sm:block">
              Your private article workspace
            </div>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
