import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import { getEvolutions } from "../pokemonUtils";

export const byId = publicProcedure
  .input(
    z.object({
      id: z.union([z.number(), z.string()]),
      language: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const lang = input.language ?? "es";
    let pokemon: Pokedex.Pokemon;
    let species: Pokedex.PokemonSpecies;

    try {
      pokemon = await pokedexInstance.getPokemonByName(input.id);
      species = await pokedexInstance.getPokemonSpeciesByName(pokemon.name);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
      throw new Error(`Failed to fetch Pokémon: ${input.id}`);
    }

    const generationData = await pokedexInstance.getGenerationByName(
      species.generation.name,
    );
    const translatedGenerationName = generationData.names?.find(
      (g) => g.language.name === lang,
    )?.name;
    const generation =
      translatedGenerationName ?? species.generation?.name ?? "?";

    const types = await Promise.all(
      pokemon.types.map(async (typeInfo: Pokedex.PokemonType) => {
        const typeData = await pokedexInstance.getTypeByName(
          typeInfo.type.name,
        );
        type TypeName = { language: { name: string }; name: string };
        const typeNameEs =
          typeData.names?.find((n: TypeName) => n.language.name === lang)
            ?.name ?? typeInfo.type.name;
        return typeNameEs;
      }),
    );

    type SpeciesName = { language: { name: string }; name: string };
    const nameEs =
      (species.names as SpeciesName[] | undefined)?.find(
        (n) => n.language.name === lang,
      )?.name ?? pokemon.name;

    const flavorTextEntry =
      species.flavor_text_entries?.find(
        (entry: Pokedex.FlavorText) =>
          entry.language.name === lang &&
          ((entry.version as Pokedex.NamedAPIResource)?.name === "scarlet" ||
            (entry.version as Pokedex.NamedAPIResource)?.name === "violet"),
      ) ??
      species.flavor_text_entries?.find(
        (entry: Pokedex.FlavorText) => entry.language.name === lang,
      ) ??
      species.flavor_text_entries?.find(
        (entry: Pokedex.FlavorText) => entry.language.name === "en",
      );

    const description = flavorTextEntry
      ? flavorTextEntry.flavor_text.replace(/\n/g, " ")
      : "No description available.";

    const translatedStats = await Promise.all(
      pokemon.stats.map(async (stat: Pokedex.StatElement) => {
        const statData = await pokedexInstance.getStatByName(stat.stat.name);
        type StatName = { language: { name: string }; name: string };
        const translatedStatName =
          statData.names?.find((n: StatName) => n.language.name === lang)
            ?.name ?? stat.stat.name;
        return {
          stat: {
            originalName: stat.stat.name,
            translatedName: translatedStatName,
          },
          value: stat.base_stat ?? 0,
        };
      }),
    );

    const evolutionChainData: unknown = await getEvolutions(species);

    return {
      stats: translatedStats,
      id: pokemon.id,
      name: nameEs,
      generation,
      types,
      image: pokemon.sprites?.front_default ?? "",
      cries: pokemon.cries,
      description,
      evolutionChain: evolutionChainData,
      weight: pokemon.weight,
      height: pokemon.height,
    };
  });
