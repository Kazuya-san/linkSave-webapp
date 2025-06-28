import Filter from "@/components/csr-filter";
import Home from "@/components/ssr-view";
import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ terms: string }>;
}) => {
  const { userId } = await auth();

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

  return (
    <div>
      <div className="container mx-auto p-4">
        <Filter />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Home searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Page;
