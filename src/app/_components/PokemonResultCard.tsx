"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { typeColors } from "@/lib/constants";
export type PokemonType = string | { name: string };

export type Pokemon = {
  id?: number;
  name?: string;
  generation?: string;
  types?: Array<PokemonType>;
  image?: string;
};

const PokemonResultCard = React.memo(function PokemonResultCard({
  pokemon,
  selectedLang,
  currentSearchParams,
}: {
  pokemon: Pokemon;
  selectedLang: string;
  currentSearchParams?: URLSearchParams;
}) {
  const searchParamsString = currentSearchParams
    ? currentSearchParams.toString()
    : "";
  const detailHref = `/pokemon/${pokemon.id}?lang=${selectedLang}${searchParamsString ? `&${searchParamsString}` : ""}`;
  return (
    <Link href={detailHref} className="block">
      <div className="border-border text-foreground flex w-full max-w-md flex-col gap-3 rounded-xl border-2 p-6 shadow-xl transition-transform duration-500 hover:scale-105">
        {pokemon.image && (
          <Image
            src={pokemon.image}
            alt={pokemon.name ?? "Pokémon"}
            width={192}
            height={192}
            quality={85}
            className="bg-background mb-4 h-48 w-48 self-center rounded-full border-4 border-blue-300 object-contain drop-shadow-lg"
            priority
          />
        )}
        <span className="text-primary text-lg font-bold tracking-wide">
          #{pokemon.id ?? "?"} {pokemon.name ?? "?"}
        </span>
        <span className="text-muted-foreground text-sm font-semibold">
          Generación:{" "}
          <span className="font-normal">{pokemon.generation ?? "?"}</span>
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <strong className="text-primary mr-2">Tipos:</strong>
          {pokemon.types && pokemon.types.length > 0 ? (
            pokemon.types.map((type, i) => {
              const typeName =
                typeof type === "string"
                  ? type.toLowerCase()
                  : (type as { name: string }).name?.toLowerCase();
              const colorClass =
                typeColors[typeName] ?? "bg-muted text-muted-foreground";
              return (
                <span
                  key={i}
                  className={`border-border rounded-full px-2 py-1 text-xs font-bold shadow ${colorClass}`}
                >
                  {typeof type === "string"
                    ? type
                    : (type as { name: string }).name}
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground">?</span>
          )}
        </span>
      </div>
    </Link>
  );
});

export default PokemonResultCard;
