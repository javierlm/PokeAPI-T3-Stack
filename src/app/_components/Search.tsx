"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "./hooks/useDebounce";

interface SearchProps {
  initialSearchTerm: string;
  onSearch: (searchTerm: string) => void;
}

export function Search({ initialSearchTerm, onSearch }: SearchProps) {
  const [internalSearchTerm, setInternalSearchTerm] =
    useState(initialSearchTerm);
  const debouncedSearch = useDebounce(internalSearchTerm);

  useEffect(() => {
    onSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(internalSearchTerm);
  };

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit}>
      <div className="relative flex items-center">
        <input
          type="search"
          placeholder="Busca un Pokémon..."
          className="w-full rounded-full border-2 border-gray-300 bg-white py-3 pr-16 pl-5 text-base text-gray-700 shadow-sm transition-colors focus:border-blue-500 focus:outline-none"
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-full bg-transparent px-4 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 2.25L12 5.25 9.75 6.75 12 8.25 13.5 11.25 15 8.25 17.25 6.75 15 5.25 13.5 2.25z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
