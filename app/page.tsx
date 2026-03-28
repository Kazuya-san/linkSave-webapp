import { auth } from "@clerk/nextjs/server";

import { getArticleWorkspaceAction } from "@/app/actions/articles";
import { LibraryWorkspace } from "@/components/library-workspace";
import { MarketingHome } from "@/components/marketing-home";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ terms?: string }>;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return <MarketingHome />;
  }

  const params = await searchParams;

  try {
    const workspace = await getArticleWorkspaceAction(params.terms);

    return <LibraryWorkspace initialState={workspace} />;
  } catch (error) {
    const setupError =
      error instanceof Error
        ? error.message
        : "The library could not connect to Supabase.";

    return (
      <main className="mx-auto flex w-full max-w-4xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="glass-panel w-full rounded-2xl p-8 sm:p-10">
          <p className="eyebrow">Setup required</p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
            The library is ready, but the data layer is not configured yet.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-300">
            {setupError}
          </p>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Confirm your Supabase URL and anon key are present, then create a
            Clerk JWT template named <span className="font-medium">supabase</span>{" "}
            so authenticated requests can satisfy row-level security.
          </p>
        </div>
      </main>
    );
  }
};

export default Page;
