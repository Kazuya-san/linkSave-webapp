import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { listUserArticles } from "@/lib/articles/service";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClientSsr();
    const { filteredArticles, featuredTopics, searchTerms, stats } =
      await listUserArticles(
        supabase,
        userId,
        req.nextUrl.searchParams.get("terms") ?? undefined,
      );

    return NextResponse.json({
      items: filteredArticles,
      featuredTopics,
      searchTerms,
      stats,
    });
  } catch (error) {
    console.error("Error loading articles:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error processing the request.",
      },
      { status: 500 },
    );
  }
}
