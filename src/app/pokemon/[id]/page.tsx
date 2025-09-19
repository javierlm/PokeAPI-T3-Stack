import { PokemonCries } from "@/app/pokemon/[id]/_components/PokemonCries";
import { PokemonStats } from "@/app/pokemon/[id]/_components/pokemon-stats";
import { typeColors } from "@/lib/constants";
import { api } from "@/trpc/server";
import Image from "next/image";
import Link from "next/link";
import { EvolutionChainDisplay } from "@/app/pokemon/[id]/_components/EvolutionChainDisplay";
import { MobileEvolutionTab } from "@/app/_components/MobileEvolutionTab";
import { ArrowLeft } from "lucide-react";

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const lang =
    typeof resolvedSearchParams.lang === "string"
      ? resolvedSearchParams.lang
      : "es";
  const pokemon = await api.pokemon.pokemonById({
    id: parseInt(id),
    language: lang,
  });

  const evolutionChainData = pokemon.evolutionChain as
    | Array<{ id: number; name: string; image: string }>
    | null
    | undefined;

  return (
    <div className="fade-in container mx-auto px-4 py-4">
      <Link
        href={{ pathname: "/", query: resolvedSearchParams }}
        className="inline-flex items-center gap-1 rounded-md bg-blue-800 px-4 py-2 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la lista
      </Link>{" "}
      <div className="mt-4 flex flex-col items-center sm:mt-2">
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={256}
          height={256}
          quality={85}
          className="h-64 w-64 object-contain sm:h-48 sm:w-48"
        />
        <div className="mt-4 flex items-center gap-2 sm:mt-2">
          <h1 className="text-4xl font-bold sm:text-3xl">{pokemon.name}</h1>
          <PokemonCries
            latestCry={pokemon.cries?.latest ?? undefined}
            legacyCry={pokemon.cries?.legacy ?? undefined}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-2">
          {pokemon.types.map((type: string | { name: string }, i: number) => {
            let typeName: string;
            if (typeof type === "string") {
              typeName = type.toLowerCase();
            } else if (
              typeof type === "object" &&
              typeof type.name === "string"
            ) {
              typeName = type.name.toLowerCase();
            } else {
              typeName = "";
            }
            const colorClass =
              typeColors[typeName] ??
              "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
            return (
              <span
                key={i}
                className={`rounded-full border border-white/30 px-3 py-1 text-sm font-bold shadow-md ${colorClass} sm:px-2 sm:py-0.5 sm:text-xs`}
              >
                {typeof type === "string" ? type : type.name}
              </span>
            );
          })}
        </div>
        <div className="mt-4 text-lg sm:mt-2 sm:text-base">
          <span className="font-semibold">Generación:</span>{" "}
          {pokemon.generation}
        </div>
        <div className="mt-4 max-w-md text-center text-base sm:mt-2 sm:text-sm lg:text-lg">
          {pokemon.description}
        </div>
        <PokemonStats
          stats={pokemon.stats
            .map(
              (stat: {
                stat: { originalName: string; translatedName: string };
                value: number;
              }) => {
                if (
                  typeof stat.stat?.originalName === "string" &&
                  typeof stat.stat?.translatedName === "string" &&
                  typeof stat.value === "number"
                ) {
                  return {
                    stat: {
                      originalName: stat.stat.originalName,
                      translatedName: stat.stat.translatedName,
                    },
                    value: stat.value,
                  };
                }
                return null;
              },
            )
            .filter(
              (
                s,
              ): s is {
                stat: { originalName: string; translatedName: string };
                value: number;
              } => s !== null,
            )}
        />
        {evolutionChainData &&
          Array.isArray(evolutionChainData) &&
          evolutionChainData.length > 1 && (
            <>
              <MobileEvolutionTab
                evolutionChain={evolutionChainData}
                currentPokemonId={pokemon.id}
                currentSearchParams={resolvedSearchParams}
              />
              <div className="hidden sm:block">
                <EvolutionChainDisplay
                  evolutionChain={evolutionChainData}
                  currentPokemonId={pokemon.id}
                  currentSearchParams={resolvedSearchParams}
                />
              </div>
            </>
          )}
      </div>
    </div>
  );
}
