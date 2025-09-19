"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface EvolutionChainDisplayProps {
  evolutionChain: { id: number; name: string; image: string }[];
  currentPokemonId: number;
  currentSearchParams: Record<string, string | string[] | undefined>;
}

export function EvolutionChainDisplay({
  evolutionChain,
  currentPokemonId,
  currentSearchParams,
}: EvolutionChainDisplayProps) {
  const router = useRouter();
  const { selectedLang } = useLanguage();

  const handleEvolutionClick = (id: number) => {
    const newSearchParams = new URLSearchParams(
      currentSearchParams as Record<string, string>,
    );
    newSearchParams.set("lang", selectedLang);
    router.push(`/pokemon/${id}?${newSearchParams.toString()}`);
  };

  return (
    <div className="mt-8 w-full max-w-2xl">
      <h2 className="mb-4 text-center text-2xl font-bold">Evoluciones</h2>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {evolutionChain.map((evolution) => (
          <div
            key={evolution.id}
            className={`flex cursor-pointer flex-col items-center rounded-lg p-2 transition-all duration-300 ${evolution.id === currentPokemonId ? "scale-110 bg-blue-200 dark:bg-blue-800" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            onClick={() => handleEvolutionClick(evolution.id)}
          >
            <Image
              src={evolution.image}
              alt={evolution.name}
              width={96}
              height={96}
              quality={85}
              className="h-24 w-24 object-contain"
            />
            <span className="mt-2 text-sm font-semibold">{evolution.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
