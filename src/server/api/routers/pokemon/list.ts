import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import {
  extractEvolutionDetails,
  getAllPokemonData,
  getCandidatePokemons,
  getEnrichedPokemonData,
} from "../pokemonUtils";

export const list = publicProcedure
  .input(
    z.object({
      search: z.string().optional(),
      language: z.string().optional(),
      types: z.array(z.string()).optional(),
      generation: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
    }),
  )
  .query(async ({ input }) => {
    const lang = input.language ?? "es";
    const initialLimit = input.limit ?? 30;
    const accumulatedPokemons: Awaited<
      ReturnType<typeof getEnrichedPokemonData>
    >[] = [];
    let currentCursor = input.cursor ?? 1;
    let totalFetched = 0;
    let totalAvailable = 0;

    while (accumulatedPokemons.length < initialLimit) {
      const currentOffset = currentCursor > 0 ? currentCursor - 1 : 0;
      // Fetch more than needed to account for potential API errors
      const limitToFetch = initialLimit - accumulatedPokemons.length + 10;

      const candidatesObject = await getCandidatePokemons(
        input.search,
        input.generation,
        limitToFetch,
        currentOffset,
        input.types,
      );

      let allPokemonNames = candidatesObject.allPokemonNames;
      totalAvailable = candidatesObject.count;
      totalFetched += allPokemonNames.length;

      if (input.search) {
        const searchTerm = input.search.toLowerCase();
        const matchingPokemonNames = allPokemonNames.filter((name) =>
          name.includes(searchTerm),
        );

        const speciesResults = await Promise.allSettled(
          matchingPokemonNames.map((name) =>
            pokedexInstance.getPokemonSpeciesByName(name),
          ),
        );

        const evolutionChainUrls = new Set(
          speciesResults
            .filter(
              (
                result,
              ): result is PromiseFulfilledResult<Pokedex.PokemonSpecies> =>
                result.status === "fulfilled" &&
                !!result.value.evolution_chain?.url,
            )
            .map((result) => result.value.evolution_chain.url),
        );

        const allEvolutionPokemonNames = new Set<string>(matchingPokemonNames);

        const evolutionChainPromises = Array.from(evolutionChainUrls).map(
          async (url) => {
            try {
              const evolutionChain = (await pokedexInstance.getResource(
                url,
              )) as Pokedex.EvolutionChain;
              const evolutionDetails = await extractEvolutionDetails(
                evolutionChain.chain,
                lang,
              );
              evolutionDetails.forEach((p) =>
                allEvolutionPokemonNames.add(p.name),
              );
            } catch (error) {
              console.error(`Failed to fetch evolution chain ${url}`, error);
            }
          },
        );

        await Promise.all(evolutionChainPromises);

        allPokemonNames = Array.from(allEvolutionPokemonNames);
      }

      let allPokemonsData = await getAllPokemonData(allPokemonNames);

      if (input.types && input.types.length > 0) {
        allPokemonsData = allPokemonsData.filter((pokemon) => {
          const hasMatchingType = pokemon.types.some((typeInfo) =>
            input.types?.includes(typeInfo.type.name),
          );
          return hasMatchingType;
        });
      }

      const enrichedPokemons = await Promise.all(
        allPokemonsData
          .filter((pokemon) => pokemon.name === pokemon.species.name)
          .map((pokemon) => getEnrichedPokemonData(pokemon, lang)),
      );

      accumulatedPokemons.push(...enrichedPokemons);
      currentCursor += allPokemonNames.length;

      if (totalFetched >= totalAvailable || allPokemonNames.length === 0) {
        break;
      }
    }

    accumulatedPokemons.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    let nextCursor: number | undefined = undefined;
    if (totalFetched < totalAvailable) {
      nextCursor = currentCursor;
    }

    return {
      pokemonList: accumulatedPokemons.slice(0, initialLimit),
      count: totalAvailable,
      nextCursor,
    };
  });
