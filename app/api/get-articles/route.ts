import { verifyToken } from "@clerk/nextjs/server";
import { tryCatch } from "@/utils/tryCatch";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized: No token", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await tryCatch(
      verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
    );

    if (error && data === null) {
      return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const terms = searchParams.get("terms")?.split(",") || [];

    console.log("terms2", searchParams);

    const client = await createClerkSupabaseClientSsr();

    // const terms = ["crypto"];

    const orConditions = terms
      .flatMap((term) => [
        `title.ilike."*${term}*"`,
        `summary.ilike."*${term}*"`,
        `tags.cs.{${term}}`,
      ])
      .join(",");

    const call = client.from("saved_links").select();

    if (terms.length > 0) {
      call.or(orConditions);
    }

    const { data: supabaseData, error: supaBaseError } = await call.order(
      "created_at",
      { ascending: false }
    );

    return NextResponse.json({
      supabaseData,
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Error processing the request", { status: 500 });
  }
}
