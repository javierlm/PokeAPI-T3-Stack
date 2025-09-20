"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { api } from "@/trpc/react";
import PokemonResultCard, {
  type Pokemon,
} from "./_components/PokemonResultCard";
import { LoadingPokeball } from "./_components/LoadingPokeball";
import { useLanguage } from "@/context/LanguageContext";
import BackToTopButton from "./_components/BackToTopButton";
import { ArrowDown, Frown } from "lucide-react";
import { SearchAndFilterWrapper } from "./_components/SearchAndFilterWrapper";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const { selectedLang } = useLanguage();
  const searchParams = useSearchParams();
  const [isInitialised, setIsInitialised] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);

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

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 30;

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setOffset(0);
    setHasMore(true);
    setPokemons([]);
  }, []);

  const handleTypeChange = useCallback((types: string[]) => {
    setSelectedTypes(types);
    setOffset(0);
    setHasMore(true);
    setPokemons([]);
  }, []);

  const handleGenerationChange = useCallback((generations: string[]) => {
    setSelectedGenerations(generations);
    setOffset(0);
    setHasMore(true);
    setPokemons([]);
  }, []);

  const { data, isLoading, isError, isFetching } =
    api.pokemon.pokemonList.useQuery(
      {
        search: searchTerm,
        language: selectedLang,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        generation:
          selectedGenerations.length > 0 ? selectedGenerations : undefined,
        limit: limit,
        offset: offset,
      },
      {
        enabled: isInitialised,
      },
    );

  useEffect(() => {
    if (data) {
      setPokemons((prevPokemons) => {
        if (offset === 0) {
          return data.pokemonList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        } else {
          const newPokemonsMap = new Map(prevPokemons.map((p) => [p.id, p]));
          data.pokemonList.forEach((p) => newPokemonsMap.set(p.id, p));
          return Array.from(newPokemonsMap.values()).sort(
            (a, b) => (a.id ?? 0) - (b.id ?? 0),
          );
        }
      });
      setHasMore(data.hasMore);
    }
  }, [data, offset]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setOffset((prevOffset) => prevOffset + limit);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center pb-20">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-12">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Poke <span className="text-[hsl(280,100%,70%)]">API</span> App
        </h1>
      </div>
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <div className="w-full">
          <SearchAndFilterWrapper
            onSearch={handleSearch}
            onTypeChange={handleTypeChange}
            onGenerationChange={handleGenerationChange}
          />
        </div>
      </Suspense>
      <div className="mx-auto mt-8 w-full max-w-7xl px-4">
        <BackToTopButton />
        {isFetching && offset === 0 ? (
          <LoadingPokeball />
        ) : isError ? (
          <p className="text-lg text-red-500">Error al cargar los Pokémon.</p>
        ) : pokemons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pokemons.map((pokemon: Pokemon) => (
              <div
                key={pokemon.id}
                className="flex w-full justify-center"
              >
                <PokemonResultCard
                  pokemon={pokemon}
                  selectedLang={selectedLang}
                  currentSearchParams={searchParams}
                />
              </div>
            ))}
          </div>
        ) : data && data.pokemonList.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Frown className="text-muted-foreground h-24 w-24" />
            <p className="text-foreground text-lg">
              No se encontraron Pokémon.
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex w-full justify-center">
        {hasMore && pokemons.length > 0 && (
          <button
            onClick={handleLoadMore}
            className="mt-12 flex h-[50px] w-[200px] cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-800 px-10 py-3 font-semibold text-white no-underline transition hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              "Cargando..."
            ) : (
              <>
                {"Cargar más"}
                <ArrowDown size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
