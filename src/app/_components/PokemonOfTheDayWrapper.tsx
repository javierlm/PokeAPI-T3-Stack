"use client";

import { Suspense, useState } from "react";
import PokemonOfTheDay from "./PokemonOfTheDay";
import ErrorBoundary from "./ErrorBoundary";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "next-intl";

export default function PokemonOfTheDayWrapper() {
  const [clientDate] = useState<string>(new Date().toISOString());
  const { locale } = useLanguage();

  const t = useTranslations("PokemonOfTheDay");

  const loadingFallback = (
    <div className="max-h-28 cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-100 p-2 shadow-lg md:cursor-default dark:border-gray-600 dark:bg-gray-800">
      <div className="flex h-full animate-pulse items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-2 flex h-8 items-center justify-center gap-2">
            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="h-6 w-32 rounded-md bg-gray-300 dark:bg-gray-700" />
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="relative h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="text-center">
              <div className="h-5 w-24 rounded-md bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const errorFallback = (
    <div className="max-h-28 rounded-2xl bg-gray-100 p-2 text-center dark:bg-gray-800">
      <p className="text-gray-600 dark:text-gray-400">{t("errorLoading")}</p>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        <PokemonOfTheDay date={clientDate} language={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
