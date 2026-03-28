import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import DynamicDataCard from "@/components/view-items";
import { findUserArticle } from "@/lib/articles/service";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";

export default async function ArticleViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { id } = await params;
  const supabase = await createClerkSupabaseClientSsr();
  const article = await findUserArticle(supabase, userId, id);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 lg:px-8 lg:py-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[rgba(18,25,36,0.92)] px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 transition hover:bg-[rgba(24,32,45,0.96)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>
      </div>

      <DynamicDataCard data={article} />
    </main>
  );
}
