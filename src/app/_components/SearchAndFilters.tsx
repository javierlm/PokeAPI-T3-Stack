"use client";
import { useState, useEffect, useRef } from "react";
import { Search } from "./Search";
import { TypeFilter } from "./TypeFilter";
import { GenerationFilter } from "./GenerationFilter";

interface SearchAndFiltersProps {
  onSearch: (searchTerm: string) => void;
  initialSearchTerm: string;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  selectedGenerations: string[];
  onGenerationChange: (generations: string[]) => void;
}

export function SearchAndFilters({
  onSearch,
  initialSearchTerm,
  selectedTypes,
  onTypeChange,
  selectedGenerations,
  onGenerationChange,
}: SearchAndFiltersProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleToggle = (filterName: string) => {
    setOpenFilter((prev) => (prev === filterName ? null : filterName));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersRef]);

  return (
    <div className="my-8 flex w-full flex-col items-center justify-center gap-4 px-4 sm:flex-row">
      <div className="w-full max-w-md">
        <Search onSearch={onSearch} initialSearchTerm={initialSearchTerm} />
      </div>
      <div className="flex gap-4" ref={filtersRef}>
        <TypeFilter
          isOpen={openFilter === "type"}
          onToggle={() => handleToggle("type")}
          selectedTypes={selectedTypes}
          onTypeChange={onTypeChange}
        />
        <GenerationFilter
          isOpen={openFilter === "generation"}
          onToggle={() => handleToggle("generation")}
          selectedGenerations={selectedGenerations}
          onGenerationChange={onGenerationChange}
        />
      </div>
    </div>
  );
}
