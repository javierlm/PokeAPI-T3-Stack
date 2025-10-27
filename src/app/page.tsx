"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { api } from "@/trpc/react";
import PokemonResultCard, {
  type Pokemon,
} from "./_components/PokemonResultCard";
import { LoadingPokeball } from "./_components/LoadingPokeball";
import { useLanguage } from "@/context/LanguageContext";
import { useScroll } from "@/context/ScrollContext";
import { ArrowDown, Frown, RotateCw } from "lucide-react";
import { SearchAndFilterWrapper } from "./_components/SearchAndFilterWrapper";
import { useSearchParams } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useIsMobile } from "./_components/hooks/useIsMobile";
import { useTranslations } from "next-intl";
import PokemonOfTheDayWrapper from "./_components/PokemonOfTheDayWrapper";

function HomeContent() {
  const t = useTranslations("HomePage");
  const { locale } = useLanguage();
  const { scrollElementRef } = useScroll();
  const searchParams = useSearchParams();
  const [isInitialised, setIsInitialised] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);

  const limit = 30;
  const isMobile = useIsMobile();
  const columns = isMobile ? 1 : 3;

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.pokemon.pokemonList.useInfiniteQuery(
      {
        search: searchTerm,
        language: locale,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        generation:
          selectedGenerations.length > 0 ? selectedGenerations : undefined,
        limit,
      },
      {
        enabled: isInitialised,
        getNextPageParam: (lastPage: { nextCursor?: number }) =>
          lastPage.nextCursor,
      },
    );

  const pokemons =
    data?.pages.flatMap(
      (page: { pokemonList: Pokemon[] }) => page.pokemonList,
    ) ?? [];

  const rowCount = Math.ceil(pokemons.length / columns);

  const ROW_HEIGHT_ESTIMATE = 420;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: !isMobile ? 2 : 1,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem &&
      lastItem.index >= rowCount - 3 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    virtualItems,
    pokemons.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rowCount,
  ]);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") ?? "");
    setSelectedTypes(
      searchParams.get("type")?.split(",").filter(Boolean) ?? [],
    );
    setSelectedGenerations(
      searchParams.get("generation")?.split(",").filter(Boolean) ?? [],
    );
    setIsInitialised(true);
  }, [searchParams]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleTypeChange = useCallback((types: string[]) => {
    setSelectedTypes(types);
  }, []);

  const handleGenerationChange = useCallback((generations: string[]) => {
    setSelectedGenerations(generations);
  }, []);

  return (
    <div className="pb-4 sm:pb-8">
      <div className="flex w-full flex-col justify-center gap-12 px-4 py-12">
        <h1 className="mx-auto w-full text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Poke <span className="text-[hsl(280,100%,70%)]">API</span> App
        </h1>
      </div>
      <div className="mx-auto w-full max-w-4xl px-4">
        <PokemonOfTheDayWrapper />
      </div>
      <Suspense fallback={<div>{t("loadingFilters")}</div>}>
        <div className="w-full">
          <SearchAndFilterWrapper
            onSearch={handleSearch}
            onTypeChange={handleTypeChange}
            onGenerationChange={handleGenerationChange}
          />
        </div>
      </Suspense>
      <div className="mx-auto mt-8 w-full max-w-7xl px-4">
        {status === "pending" ? (
          <LoadingPokeball />
        ) : status === "error" ? (
          <p className="text-lg text-red-500">{t("errorLoadingPokemon")}</p>
        ) : pokemons.length > 0 ? (
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const endIndex = Math.min(startIndex + columns, pokemons.length);
              const rowPokemons = pokemons.slice(startIndex, endIndex);

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
                    gap: "1rem",
                  }}
                >
                  {rowPokemons.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="flex w-full justify-center"
                    >
                      <PokemonResultCard
                        pokemon={pokemon}
                        currentSearchParams={searchParams}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : status === "success" && pokemons.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Frown className="text-muted-foreground h-24 w-24" />
            <p className="text-foreground text-lg">{t("noPokemonFound")}</p>
          </div>
        ) : null}
      </div>
      {isFetchingNextPage && (
        <div className="flex w-full justify-center py-4">
          <LoadingPokeball />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <HomeContent />
    </Suspense>
  );
}
