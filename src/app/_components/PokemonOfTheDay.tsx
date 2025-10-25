"use client";

import { api } from "@/trpc/react";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { typeColors } from "@/lib/constants";

interface PokemonOfTheDayProps {
  date: string;
  language: string;
}

export default function PokemonOfTheDay({
  date,
  language,
}: PokemonOfTheDayProps) {
  const t = useTranslations("PokemonOfTheDay");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const [data] = api.pokemon.pokemonOfTheDay.useSuspenseQuery({
    date,
    language,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const { pokemon } = data;

  return (
    <section
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-100 shadow-lg transition-[max-height,padding] duration-500 ease-in-out md:cursor-default dark:border-gray-600 dark:bg-gray-800 ${isCollapsed ? "max-h-28 p-2" : "max-h-[500px] p-6"}`}
    >
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-2 flex h-8 items-center justify-center gap-2">
            <CalendarDays className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <h2
              className={`flex items-center font-bold text-gray-900 transition-all duration-300 dark:text-gray-100 ${
                isCollapsed ? "text-base" : "text-xl"
              }`}
            >
              {t("title")}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="pointer-events-none flex flex-shrink-0 items-center justify-center rounded p-1 transition-all duration-300 md:pointer-events-auto md:hover:scale-110 md:hover:bg-gray-200 md:dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-center transition-transform duration-300 ease-in-out">
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </button>
          </div>
          <div
            className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? "flex-row gap-2" : "flex-col gap-2"}`}
          >
            <div
              className={`relative transition-all duration-300 ${isCollapsed ? "h-10 w-10" : "h-32 w-32"}`}
            >
              <Image
                src={pokemon.image ?? "/favicon.ico"}
                alt={pokemon.name}
                fill
                sizes={isCollapsed ? "40px" : "128px"}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center">
              <h3
                className={`font-bold text-gray-900 capitalize transition-all duration-300 dark:text-gray-100 ${isCollapsed ? "text-sm" : "text-2xl"}`}
              >
                {pokemon.name}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${isCollapsed ? "invisible h-0 opacity-0" : "visible h-auto opacity-100"}`}
      >
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {pokemon.types?.map(
              (type: { name: string } | string, index: number) => {
                const typeName =
                  typeof type === "string"
                    ? type.toLowerCase()
                    : (type as { name: string }).name?.toLowerCase();
                const colorClass =
                  typeColors[typeName] ?? "bg-muted text-muted-foreground";

                return (
                  <span
                    key={index}
                    className={`border-border rounded-full px-2 py-1 text-xs font-bold shadow ${colorClass}`}
                  >
                    {typeof type === "string"
                      ? type
                      : (type as { name: string }).name}
                  </span>
                );
              },
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("generationText")} {pokemon.generation}
          </p>

          <Link
            href={`/pokemon/${pokemon.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {t("viewDetails")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
