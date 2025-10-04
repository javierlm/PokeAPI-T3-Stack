import { api } from "@/trpc/server";
import { PokemonDetailWrapper } from "./_components/PokemonDetailWrapper";
import { getLocaleFromCookie } from "@/lib/locale";

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const currentLocale = await getLocaleFromCookie();

  const pokemon = await api.pokemon.pokemonById({
    id: parseInt(id),
    language: currentLocale,
  });

  return (
    <PokemonDetailWrapper
      pokemon={pokemon}
      resolvedSearchParams={resolvedSearchParams}
    />
  );
}
