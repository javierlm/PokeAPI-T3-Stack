import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import {
  extractEvolutionDetails,
  getAllPokemonData,
  getCandidatePokemons,
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

    let enrichedPokemons = [];
    if (input.search) {
      enrichedPokemons = await Promise.all(
        allPokemonsData
          .filter((pokemon) => pokemon.name === pokemon.species.name)
          .map(async (pokemon: Pokedex.Pokemon) => {
            const speciesNameForGeneration = pokemon.name.includes("-mega")
              ? pokemon.name.split("-mega")[0]
              : pokemon.name;
            const species = await pokedexInstance.getPokemonSpeciesByName(
              speciesNameForGeneration!,
            );
            const generationData = await pokedexInstance.getGenerationByName(
              species.generation.name,
            );
            const translatedGenerationName = generationData.names?.find(
              (g) => g.language.name === lang,
            )?.name;
            const generation =
              translatedGenerationName ?? species.generation?.name ?? "?";

            // Obtiene los tipos en español
            const types = await Promise.all(
              pokemon.types.map(async (typeInfo: Pokedex.PokemonType) => {
                const typeData = await pokedexInstance.getTypeByName(
                  typeInfo.type.name,
                );
                type TypeName = {
                  language: { name: string };
                  name: string;
                };
                const typeNameEs =
                  typeData.names?.find(
                    (n: TypeName) => n.language.name === lang,
                  )?.name ?? typeInfo.type.name;
                return typeNameEs;
              }),
            );

            // Obtain the Pokemon name in a given lang (PokeAPI seems to have structured the data this way)
            type SpeciesName = {
              language: { name: string };
              name: string;
            };
            const nameEs =
              (species.names as SpeciesName[] | undefined)?.find(
                (n) => n.language.name === lang,
              )?.name ?? pokemon.name;

            return {
              id: pokemon.id,
              name: nameEs,
              generation,
              types,
              image: pokemon.sprites?.front_default ?? "",
            };
          }),
      );
    } else {
      const allTypes = await pokedexInstance.getTypesList();
      const allGenerations = await pokedexInstance.getGenerationsList();

      const translatedTypesMap = new Map<string, string>();
      await Promise.all(
        allTypes.results.map(async (typeInfo: Pokedex.NamedAPIResource) => {
          const typeData = await pokedexInstance.getTypeByName(typeInfo.name);
          type TypeName = { language: { name: string }; name: string };
          const translatedName =
            typeData.names?.find((n: TypeName) => n.language.name === lang)
              ?.name ?? typeInfo.name;
          translatedTypesMap.set(typeInfo.name, translatedName);
        }),
      );

      const translatedGenerationsMap = new Map<string, string>();
      await Promise.all(
        allGenerations.results.map(
          async (genInfo: Pokedex.NamedAPIResource) => {
            const generationData: Pokedex.Generation =
              await pokedexInstance.getGenerationByName(genInfo.name);
            type GenerationName = {
              language: { name: string };
              name: string;
            };
            const translatedName =
              generationData.names?.find(
                (n: GenerationName) => n.language.name === lang,
              )?.name ?? genInfo.name;
            translatedGenerationsMap.set(genInfo.name, translatedName);
          },
        ),
      );

      enrichedPokemons = await Promise.all(
        allPokemonsData
          .filter((pokemon) => pokemon.name === pokemon.species.name)
          .map(async (pokemon: Pokedex.Pokemon) => {
            const species = await pokedexInstance.getPokemonSpeciesByName(
              pokemon.species.name,
            );
            const generation =
              translatedGenerationsMap.get(species.generation.name) ??
              species.generation.name;
            const types = pokemon.types.map(
              (typeInfo: Pokedex.PokemonType) =>
                translatedTypesMap.get(typeInfo.type.name) ??
                typeInfo.type.name,
            );
            type SpeciesName = {
              language: { name: string };
              name: string;
            };
            const nameEs =
              (species.names as SpeciesName[] | undefined)?.find(
                (n) => n.language.name === lang,
              )?.name ?? pokemon.name;

            return {
              id: pokemon.id,
              name: nameEs,
              generation,
              types,
              image: pokemon.sprites?.front_default ?? "",
            };
          }),
      );
    }

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
