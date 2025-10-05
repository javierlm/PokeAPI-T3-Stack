"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Ruler, Weight } from "lucide-react";
import { useTranslations } from "next-intl";
import { PokemonCries } from "@/app/pokemon/[id]/_components/PokemonCries";
import { PokemonStats } from "@/app/pokemon/[id]/_components/pokemon-stats";
import { EvolutionChainDisplay } from "@/app/pokemon/[id]/_components/EvolutionChainDisplay";
import { typeColors } from "@/lib/constants";
import { useLoading } from "@/context/LoadingContext";

interface PokemonDetailWrapperProps {
  pokemon: {
    id: number;
    name: string;
    image: string;
    shinyImage: string;
    cries?: { latest?: string | null; legacy?: string | null };
    types: Array<string | { name: string }>;
    generation: string;
    description: string;
    stats: Array<{
      stat: { originalName: string; translatedName: string };
      value: number;
    }>;
    evolutionChain?: unknown;
    weight: number;
    height: number;
  };
  resolvedSearchParams: Record<string, string | string[] | undefined>;
}

export function PokemonDetailWrapper({
  pokemon,
  resolvedSearchParams,
}: PokemonDetailWrapperProps) {
  const t = useTranslations("PokemonDetailPage");
  const { stopLoading } = useLoading();
  const [isShiny, setIsShiny] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  const handleShinyToggle = () => {
    if (isToggling) {
      return;
    }
    setIsToggling(true);
    setIsShiny((prev) => !prev);
    setTimeout(() => {
      setIsToggling(false);
    }, 50);
  };

  const evolutionChainData = pokemon.evolutionChain as
    | Array<{
        id: number;
        name: string;
        translatedName: string;
        image: string;
      }>
    | null
    | undefined;

  return (
    <div className="fade-in container mx-auto px-4 py-4">
      <Link
        href={{ pathname: "/", query: resolvedSearchParams }}
        className="inline-flex items-center gap-1 rounded-md bg-blue-800 px-4 py-2 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToList")}
      </Link>{" "}
      <div className="mt-4 flex flex-col items-center sm:mt-2">
        <div className="relative h-64 w-64 sm:h-48 sm:w-48">
          {isShiny ? (
            <Image
              src={pokemon.shinyImage}
              alt={`Shiny ${pokemon.name}`}
              width={256}
              height={256}
              quality={85}
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              width={256}
              height={256}
              quality={85}
              priority={true}
              className="h-full w-full object-contain"
            />
          )}
        </div>
        {pokemon.shinyImage && (
          <button
            onClick={handleShinyToggle}
            disabled={isToggling}
            className={`mx-auto mt-2 rounded-full p-2 shadow-md transition-colors ${
              isShiny ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"
            } disabled:opacity-50`}
            aria-label={isShiny ? t("showNormal") : t("showShiny")}
            title={isShiny ? t("showNormal") : t("showShiny")}
          >
            <Sparkles className="h-5 w-5" />
          </button>
        )}
        <div className="mt-4 flex items-center gap-2 sm:mt-2">
          <h1 className="text-4xl font-bold sm:text-3xl">{pokemon.name}</h1>
          <PokemonCries
            latestCry={pokemon.cries?.latest ?? undefined}
            legacyCry={pokemon.cries?.legacy ?? undefined}
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 sm:mt-2">
          <div className="flex items-center gap-1">
            <Weight className="h-8 w-8" />
            <span className="text-lg sm:text-base">
              {(pokemon.weight / 10).toFixed(1)} kg
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="h-8 w-8" />
            <span className="text-lg sm:text-base">
              {(pokemon.height / 10).toFixed(1)} m
            </span>
          </div>
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
          <span className="font-semibold">{t("generation")}:</span>{" "}
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
            <EvolutionChainDisplay
              evolutionChain={evolutionChainData}
              currentPokemonId={pokemon.id}
              currentSearchParams={resolvedSearchParams}
            />
          )}
      </div>
    </div>
  );
}
