import DynamicDataCard from "@/components/view-items";
import { BookOpen, User, FileText, List, Quote } from "lucide-react";
import { tryCatch } from "@/utils/tryCatch";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

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
  searchParams: Promise<{ terms: string }>;
}) {
  const terms = (await searchParams).terms;
  const { getToken } = await auth();

  const token = await getToken();

  const { data, error } = await tryCatch<any, any>(
    fetchSavedLinks(terms, token as string)
  );

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <div className="px-5 lg:px-20 py-8">
        {data?.supabaseData?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.supabaseData.map((item: any) => (
              <Link key={item.id} href={`/view/${item.id}`}>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:cursor-pointer hover:border-gray-600 hover:bg-gray-800/70 transition-all duration-300 group min-h-[400px]">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>ID: {item.id}</span>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      by {item.author}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Key Points */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <List className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Key Points
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.key_points
                        ?.slice(0, 3)
                        .map((point: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md"
                          >
                            {point}
                          </span>
                        ))}
                      {item.keypoints?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
                          +{item.keypoints.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Read More Button */}
                  {/* <div className="mt-4 pt-4 border-t border-gray-700">
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    Read More
                  </button>
                </div> */}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No saved links found.</p>
            <p className="text-gray-500 text-sm mt-2">
              Your content will appear here once you start saving links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
