import DynamicDataCard from "@/components/view-items";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";
import { tryCatch } from "@/utils/tryCatch";
import { auth } from "@clerk/nextjs/server";

const fetchSavedLinks = async (terms: string | undefined, token: string) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/get-articles`);

  if (terms && terms.length > 0) {
    url.searchParams.append("terms", terms);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return data;
};

export default async function Home({
  searchParams,
}: {
  searchParams: { terms: string };
}) {
  const terms = (await searchParams).terms;
  const { userId, getToken } = await auth();

  const token = await getToken();

  if (!userId) {
    return (
      //design a beautiful error msg
      <div className="flex items-center flex-col justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">
          Please log in to view your saved links.
        </h1>
        <p className="text-gray-500">
          You can log in using the button in the top right corner.
        </p>
        <p className="text-gray-500">
          If you don't have an account, you can sign up for free.
        </p>
        <p className="text-gray-500">
          If you are already logged in, please refresh the page.
        </p>
      </div>
    );
  }

  const { data, error } = await tryCatch<any, any>(
    fetchSavedLinks(terms, token as string)
  );

  // console.log("datassdd", supabaseData);

  // const client = await createClerkSupabaseClientSsr();

  // // const terms = ["crypto"];

  // const orConditions = terms
  //   .flatMap((term) => [
  //     `title.ilike."*${term}*"`,
  //     `summary.ilike."*${term}*"`,
  //     `tags.cs.{${term}}`,
  //   ])
  //   .join(",");

  // const call = client.from("saved_links").select();

  // if (terms.length > 0) {
  //   call.or(orConditions);
  // }

  // const { data, error } = await call.order("created_at", { ascending: false });

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <div className="px-5 lg:px-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-4">
      {data?.supabaseData?.map((item: any) => (
        <DynamicDataCard key={item?.id} data={item} />
      )) ?? <p>No saved links found.</p>}
    </div>
  );
}
