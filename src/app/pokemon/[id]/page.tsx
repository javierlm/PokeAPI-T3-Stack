import { api } from "@/trpc/server";
import { PokemonDetailWrapper } from "./_components/PokemonDetailWrapper";

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

  return (
    <PokemonDetailWrapper
      pokemon={pokemon}
      resolvedSearchParams={resolvedSearchParams}
    />
  );
}
