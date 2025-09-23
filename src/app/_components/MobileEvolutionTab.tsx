"use client";

import { EvolutionChainDisplay } from "../pokemon/[id]/_components/EvolutionChainDisplay";

interface MobileEvolutionTabProps {
  evolutionChain: {
    id: number;
    name: string;
    translatedName: string;
    image: string;
  }[];
  currentPokemonId: number;
  currentSearchParams: Record<string, string | string[] | undefined>;
}

export function MobileEvolutionTab({
  evolutionChain,
  currentPokemonId,
  currentSearchParams,
}: MobileEvolutionTabProps) {
  return (
    <div className="mt-8 w-full sm:hidden">
      <div className="mt-4">
        <EvolutionChainDisplay
          evolutionChain={evolutionChain}
          currentPokemonId={currentPokemonId}
          currentSearchParams={currentSearchParams}
        />
      </div>
    </div>
  );
}
