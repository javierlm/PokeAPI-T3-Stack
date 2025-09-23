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
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
  )
  .query(async ({ input }) => {
    const lang = input.language ?? "es";
    const candidatesObject = await getCandidatePokemons(
      input.search,
      input.generation,
      input.limit,
      input.offset,
      input.types,
    );
    let allPokemonNames = candidatesObject.allPokemonNames;
    const count = candidatesObject.count;

    // Filtering by search term
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

    // Fetch all pokemon data. Some names can't be found on the API for some reason. We obtain only promises fulfilled and discard the rest to return data
    let allPokemonsData = await getAllPokemonData(allPokemonNames);

    //Filtering by types
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

    enrichedPokemons.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const limit = input.limit ?? 30;
    const offset = input.offset ?? 0;

    const noFilters =
      !input.search && !input.generation?.length && !input.types?.length;
    const paginatedPokemons = noFilters
      ? enrichedPokemons
      : enrichedPokemons.slice(offset, offset + limit);

    const result = {
      pokemonList: paginatedPokemons,
      count,
      hasMore: paginatedPokemons?.length >= limit && offset + limit < count,
    };

    // console.log("result", result);
    return result;
  });
