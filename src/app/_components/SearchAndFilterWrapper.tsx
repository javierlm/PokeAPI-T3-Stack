"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchAndFilters } from "./SearchAndFilters";

interface SearchAndFilterWrapperProps {
  onSearch: (term: string) => void;
  onTypeChange: (types: string[]) => void;
  onGenerationChange: (generations: string[]) => void;
}

export function SearchAndFilterWrapper({
  onSearch,
  onTypeChange,
  onGenerationChange,
}: SearchAndFilterWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type")?.split(",").filter(Boolean) ?? [],
  );
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>(
    searchParams.get("generation")?.split(",").filter(Boolean) ?? [],
  );

  const resetAndApplyFilters = useCallback(
    (
      newSearchTerm: string,
      newSelectedTypes: string[],
      newSelectedGenerations: string[],
    ) => {
      const newSearchParams = new URLSearchParams();
      if (newSearchTerm) {
        newSearchParams.set("search", newSearchTerm);
      }
      if (newSelectedTypes.length > 0) {
        newSearchParams.set("type", newSelectedTypes.join(","));
      }
      if (newSelectedGenerations.length > 0) {
        newSearchParams.set("generation", newSelectedGenerations.join(","));
      }
      router.push(`?${newSearchParams.toString()}`);
    },
    [router],
  );

  const prevSearchParamsRef = useRef<string>("");

  useEffect(() => {
    const currentSearchParamsStr = searchParams.toString();

    if (currentSearchParamsStr !== prevSearchParamsRef.current) {
      prevSearchParamsRef.current = currentSearchParamsStr;

      const newSearchTerm = searchParams.get("search") ?? "";
      const newSelectedTypes =
        searchParams.get("type")?.split(",").filter(Boolean) ?? [];
      const newSelectedGenerations =
        searchParams.get("generation")?.split(",").filter(Boolean) ?? [];

      setSearchTerm(newSearchTerm);
      setSelectedTypes(newSelectedTypes);
      setSelectedGenerations(newSelectedGenerations);
    }
  }, [searchParams]);

  const handleSearchInternal = (term: string) => {
    const newSearchTerm = term;
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
    resetAndApplyFilters(newSearchTerm, selectedTypes, selectedGenerations);
  };

  const handleTypeChangeInternal = (types: string[]) => {
    setSelectedTypes(types);
    onTypeChange(types);
    resetAndApplyFilters(searchTerm, types, selectedGenerations);
  };

  const handleGenerationChangeInternal = (generations: string[]) => {
    setSelectedGenerations(generations);
    onGenerationChange(generations);
    resetAndApplyFilters(searchTerm, selectedTypes, generations);
  };

  return (
    <SearchAndFilters
      onSearch={handleSearchInternal}
      initialSearchTerm={searchTerm}
      selectedTypes={selectedTypes}
      onTypeChange={handleTypeChangeInternal}
      selectedGenerations={selectedGenerations}
      onGenerationChange={handleGenerationChangeInternal}
    />
  );
}
