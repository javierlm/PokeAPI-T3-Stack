import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { typeColors } from "@/lib/constants";
import { useLoading } from "@/context/LoadingContext";
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
  currentSearchParams,
}: {
  pokemon: Pokemon;
  currentSearchParams?: URLSearchParams;
}) {
  const t = useTranslations("PokemonCard");
  const { startLoading } = useLoading();

  const queryForLink = new URLSearchParams(currentSearchParams);

  return (
    <Link
      href={{
        pathname: `/pokemon/${pokemon.id}`,
        query: queryForLink.toString(),
      }}
      className="block"
      onClick={startLoading}
    >
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
          {t("generation")}{" "}
          <span className="font-normal">{pokemon.generation ?? "?"}</span>
        </span>
        <div className="mt-2 flex items-center gap-2 overflow-hidden">
          <strong className="text-primary mr-2 shrink-0">{t("types")}</strong>
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
        </div>
      </div>
    </Link>
  );
});

export default PokemonResultCard;
