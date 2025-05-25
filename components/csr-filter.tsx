"use client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

const Filter = () => {
  const [filter, setFilter] = React.useState<string[]>([]);

  const router = useRouter();
  const [
    isPending,
    startTransition,
    //   useTransition
  ] = useTransition();
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white">Filter</h2>
      <input
        type="text"
        value={filter.map((term) => term.trim()).join(", ")}
        onChange={(e) => {
          setFilter(e.target.value.split(","));
        }}
        placeholder="Type to filter..."
        className="p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            router.replace(`/?terms=${encodeURIComponent(filter.join(","))}`);
          });
        }}
        className={`p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPending ? <span>Loading...</span> : <span>Filter</span>}
      </button>
    </div>
  );
};

export default Filter;
