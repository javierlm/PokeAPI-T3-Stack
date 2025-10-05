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

function HomeContent() {
  const t = useTranslations("HomePage");
  const { locale } = useLanguage();
  const { scrollElementRef } = useScroll();
  const searchParams = useSearchParams();
  const [isInitialised, setIsInitialised] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 30;
  const isMobile = useIsMobile();
  const columns = isMobile ? 1 : 3;

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
    setOffset(0);
    setHasMore(true);
  }, []);

  const handleTypeChange = useCallback((types: string[]) => {
    setSelectedTypes(types);
    setOffset(0);
    setHasMore(true);
  }, []);

  const handleGenerationChange = useCallback((generations: string[]) => {
    setSelectedGenerations(generations);
    setOffset(0);
    setHasMore(true);
  }, []);

  const { data, isLoading, isError, isFetching } =
    api.pokemon.pokemonList.useQuery(
      {
        search: searchTerm,
        language: locale,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        generation:
          selectedGenerations.length > 0 ? selectedGenerations : undefined,
        limit,
        offset,
      },
      { enabled: isInitialised },
    );

  useEffect(() => {
    if (data) {
      if (offset === 0) {
        setPokemons(data.pokemonList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
      } else {
        setPokemons((prevPokemons) => {
          const newPokemonsMap = new Map(prevPokemons.map((p) => [p.id, p]));
          data.pokemonList.forEach((p) => newPokemonsMap.set(p.id, p));
          return Array.from(newPokemonsMap.values()).sort(
            (a, b) => (a.id ?? 0) - (b.id ?? 0),
          );
        });
      }
      setHasMore(data.hasMore);
    }
  }, [data, offset]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setOffset((prevOffset) => prevOffset + limit);
    }
  };

  return (
    <div className="pb-4 sm:pb-8">
      <div className="flex w-full flex-col justify-center gap-12 px-4 py-12">
        <h1 className="mx-auto w-full text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Poke <span className="text-[hsl(280,100%,70%)]">API</span> App
        </h1>
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
        {isFetching && offset === 0 ? (
          <LoadingPokeball />
        ) : isError ? (
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
        ) : data && data.pokemonList.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Frown className="text-muted-foreground h-24 w-24" />
            <p className="text-foreground text-lg">{t("noPokemonFound")}</p>
          </div>
        ) : null}
      </div>
      <div className="flex w-full justify-center">
        {hasMore && pokemons.length > 0 && !(isFetching && offset === 0) && (
          <button
            onClick={handleLoadMore}
            className="mt-12 flex h-[50px] w-[200px] cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-800 px-10 py-3 font-semibold text-white no-underline transition hover:bg-blue-700"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                {t("loading")} <RotateCw size={20} className="animate-spin" />
              </>
            ) : (
              <>
                {t("loadMore")} <ArrowDown size={20} />
              </>
            )}
          </button>
        )}
      </div>
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
