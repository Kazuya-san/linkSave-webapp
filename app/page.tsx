import Filter from "@/components/csr-filter";
import Home from "@/components/ssr-view";
import React, { Suspense } from "react";

const page = ({
  searchParams,
}: {
  searchParams: Promise<{ terms: string }>;
}) => {
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

export default page;
