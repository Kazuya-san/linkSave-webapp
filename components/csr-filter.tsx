"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";
import { Search, X, Filter as FilterIcon } from "lucide-react";

const Filter = () => {
  const [filter, setFilter] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setFilter(
      value
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.length > 0)
    );
  };

  const removeFilter = (indexToRemove: number) => {
    const newFilter = filter.filter((_, index) => index !== indexToRemove);
    setFilter(newFilter);
    setInputValue(newFilter.join(", "));
  };

  const clearAll = () => {
    setFilter([]);
    setInputValue("");
    startTransition(() => {
      router.replace("/");
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <FilterIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Smart Filter
          </h2>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter filter terms separated by commas..."
              className="w-full pl-3 focus:pl-5 pr-4 py-3 bg-zinc-800 border border-gray-700 rounded-xl 
                       text-white placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                       transition-all duration-200 backdrop-blur-sm"
            />
            {inputValue && (
              <button
                onClick={clearAll}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Tags */}
          {filter.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.map((term, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 
                           text-white text-sm rounded-full shadow-lg animate-in fade-in duration-200"
                >
                  <span>{term}</span>
                  <button
                    onClick={() => removeFilter(index)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              disabled={isLoading || filter.length === 0}
              onClick={() => {
                startTransition(() => {
                  router.replace(
                    `/?terms=${encodeURIComponent(filter.join(","))}`
                  );
                });
              }}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white font-medium rounded-xl shadow-lg
                       hover:from-blue-700 hover:to-purple-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Applying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FilterIcon className="w-4 h-4" />
                  <span>Apply</span>
                </div>
              )}
            </button>

            <button
              onClick={clearAll}
              className="py-3 px-4 bg-zinc-700 text-white font-medium rounded-xl shadow-md hover:bg-zinc-600 
                        transition-all duration-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="mt-4 text-sm text-gray-400 text-center">
          Separate multiple terms with commas
        </p>
      </div>
    </div>
  );
};

export default Filter;
