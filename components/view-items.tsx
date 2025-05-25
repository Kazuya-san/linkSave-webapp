import React from "react";

interface DynamicDataCardProps {
  data: Record<string, any>;
  excludeKeys?: string[];
}

const DynamicDataCard: React.FC<DynamicDataCardProps> = ({
  data,
  excludeKeys = ["content", "user_id"], // Default keys to exclude
}) => {
  // Helper function to determine if a value should be rendered as an array
  const isArrayValue = (value: any) => Array.isArray(value) && value.length > 0;

  // Helper function to determine if a value is a primitive (string, number, boolean)
  const isPrimitive = (value: any) => {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    );
  };

  // Filter out keys that shouldn't be displayed
  const renderableKeys = Object.keys(data).filter(
    (key) => !excludeKeys.includes(key)
  );

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 bg-gray-800 text-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{data.title || "Untitled"}</h2>
            {data.author && (
              <p className="text-purple-200 mt-1">
                {data.author !== "Unknown"
                  ? `By ${data.author}`
                  : "Author Unknown"}
              </p>
            )}
          </div>
          {data.read_time_minutes && (
            <span className="inline-flex items-center rounded-full border border-purple-500 bg-purple-800 px-2.5 py-0.5 text-xs font-semibold text-white">
              {data.read_time_minutes} min read
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Character Traits Section */}
        {data.excerpt && data.excerpt.includes("Meticulous, Decisive") && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Character Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.excerpt
                .split(",")
                .slice(
                  0,
                  data.excerpt.indexOf("He is") > 0
                    ? data.excerpt.indexOf("He is")
                    : 8
                )
                .map((trait: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-indigo-900 px-2.5 py-0.5 text-xs font-semibold text-indigo-200"
                  >
                    {trait.trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Render summary first if it exists */}
        {data.summary && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="border-t border-gray-700 my-6"></div>

        {/* Dynamically render all other fields */}
        {renderableKeys.map((key) => {
          // Skip keys we've already handled and null/undefined values
          if (
            key === "title" ||
            key === "author" ||
            key === "summary" ||
            key === "read_time_minutes" ||
            data[key] === null ||
            data[key] === undefined
          ) {
            return null;
          }

          // Format the key for display
          const displayKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div key={key} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {displayKey}
              </h3>

              {/* Render arrays */}
              {isArrayValue(data[key]) && (
                <div>
                  {key === "tags" || key === "named_entities" ? (
                    <div className="flex flex-wrap gap-2">
                      {data[key].map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-indigo-900 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : key === "key_points" ? (
                    <ul className="space-y-2">
                      {data[key].map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-6 h-6 rounded-full bg-purple-800 text-purple-200 text-xs flex items-center justify-center mr-2 mt-1">
                            {idx + 1}
                          </span>
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : key === "quotes" ? (
                    <div className="max-h-60 rounded-md border border-gray-700 bg-gray-900 p-4 overflow-y-auto">
                      {data[key].map((quote: string, idx: number) => (
                        <blockquote
                          key={idx}
                          className="border-l-4 border-purple-600 pl-4 italic text-gray-300 mb-3"
                        >
                          {quote}
                        </blockquote>
                      ))}
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {data[key].map((item: any, idx: number) => (
                        <li key={idx}>
                          {isPrimitive(item)
                            ? item.toString()
                            : JSON.stringify(item)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Render primitives */}
              {isPrimitive(data[key]) && !isArrayValue(data[key]) && (
                <p className="text-gray-300">
                  {key === "url" ? (
                    <a
                      href={data[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      {data[key]}
                    </a>
                  ) : key === "created_at" || key === "publication_date" ? (
                    data[key] ? (
                      new Date(data[key]).toLocaleDateString()
                    ) : (
                      "Not available"
                    )
                  ) : (
                    data[key].toString()
                  )}
                </p>
              )}

              {/* Render objects */}
              {!isPrimitive(data[key]) && !isArrayValue(data[key]) && (
                <pre className="bg-gray-900 p-3 rounded-md text-sm overflow-x-auto text-gray-300">
                  {JSON.stringify(data[key], null, 2)}
                </pre>
              )}
            </div>
          );
        })}

        {/* Full Content Section */}
        {data.content && !excludeKeys.includes("content") && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Full Content
            </h3>
            <div className="max-h-96 rounded-md border border-gray-700 bg-gray-900 p-4 overflow-y-auto">
              <div className="text-gray-300 whitespace-pre-line">
                {data.content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {data.id && `ID: ${data.id.substring(0, 8)}...`}
        </div>
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
          >
            Source
          </a>
        )}
      </div>
    </div>
  );
};

export default DynamicDataCard;
