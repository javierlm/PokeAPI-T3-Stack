import { z } from "zod";
import Pokedex from "pokedex-promise-v2";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const pokedexInstance = new Pokedex();

type EvolutionChainLink = {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
};

const extractEvolutionDetails = async (
  chainLink: EvolutionChainLink,
): Promise<{ id: number; name: string; image: string }[]> => {
  const pokemonName = chainLink.species.name;
  const pokemonData = await pokedexInstance.getPokemonByName(pokemonName);
  const imageUrl = pokemonData.sprites?.front_default ?? "";
  const pokemonId = pokemonData.id;

  let details = [{ id: pokemonId, name: pokemonName, image: imageUrl }];

  for (const evolution of chainLink.evolves_to) {
    details = details.concat(await extractEvolutionDetails(evolution));
  }
  return details;
};

const getEvolutions = async (
  species: Pokedex.PokemonSpecies,
): Promise<{ id: number; name: string; image: string }[] | undefined> => {
  let evolutionChainData: { id: number; name: string; image: string }[] = [];
  if (species.evolution_chain?.url) {
    try {
      const evolutionChain = (await pokedexInstance.getResource(
        species.evolution_chain.url,
      )) as Pokedex.EvolutionChain;

      evolutionChainData = await extractEvolutionDetails(evolutionChain.chain);
      return evolutionChainData;
    } catch (error) {
      console.error("Error fetching evolution chain for detail page:", error);
    }
  }
};

const getCandidatePokemons = async (
  inputSearch: string | undefined,
  inputGeneration: Array<string> | undefined,
  inputLimit: number | undefined,
  inputOffset: number | undefined,
  inputTypes: Array<string> | undefined,
): Promise<{ allPokemonNames: string[]; count: number }> => {
  let allPokemonNames: string[] = [];
  let count = 0;
  //If generation, we obtain the names directly from the generations
  if (inputGeneration) {
    const generationData =
      await pokedexInstance.getGenerationByName(inputGeneration);
    const pokemonNamesFromGenerations = generationData
      .map((currentGeneration) =>
        currentGeneration.pokemon_species.map((species) => species.name),
      )
      .flat();
    count = pokemonNamesFromGenerations.length;
    allPokemonNames = pokemonNamesFromGenerations;
  } else {
    //If no generation, we obtain directly the names
    const allPokemonNamesResponse = await pokedexInstance.getPokemonsList({
      limit: !inputSearch && !inputTypes ? inputLimit : 3000,
      offset: !inputSearch && !inputTypes ? inputOffset : 0,
    });
    allPokemonNames = allPokemonNamesResponse.results.map(
      (pokemon) => pokemon.name,
    );
    count = allPokemonNamesResponse.count;
  }
  if (inputTypes) {
    const pokemonsByType = (
      await pokedexInstance.getTypeByName(inputTypes)
    ).flatMap((pokemonType) =>
      pokemonType.pokemon.map((pokemon) => pokemon.pokemon.name),
    );
    const setB = new Set(pokemonsByType);
    const nuevaLista = allPokemonNames.filter((item) => setB.has(item));
    allPokemonNames = structuredClone(nuevaLista);
  }
  return { allPokemonNames, count };
};

export const pokemonRouter = createTRPCRouter({
  pokemonList: publicProcedure
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
    }),
  pokemonById: publicProcedure
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
      };
    }),
  getPokemonTypes: publicProcedure
    .input(z.object({ language: z.string().optional() }))
    .query(async ({ input }) => {
      const lang = input.language ?? "es";
      const allTypes = await pokedexInstance.getTypesList();

      const translatedTypes = await Promise.all(
        allTypes.results.map(async (typeInfo: Pokedex.NamedAPIResource) => {
          const typeData = await pokedexInstance.getTypeByName(typeInfo.name);
          type TypeName = { language: { name: string }; name: string };
          const translatedName =
            typeData.names?.find((n: TypeName) => n.language.name === lang)
              ?.name ?? typeInfo.name;
          return {
            originalName: typeInfo.name,
            translatedName: translatedName,
          };
        }),
      );
      return translatedTypes;
    }),
  getPokemonGenerations: publicProcedure
    .input(z.object({ language: z.string().optional() }))
    .query(async ({ input }) => {
      const lang = input.language ?? "es";
      const allGenerations = await pokedexInstance.getGenerationsList();
      const translatedGenerations = await Promise.all(
        allGenerations.results.map(
          async (genInfo: Pokedex.NamedAPIResource) => {
            const generationData: Pokedex.Generation =
              await pokedexInstance.getGenerationByName(genInfo.name);
            type GenerationName = { language: { name: string }; name: string };
            const translatedName =
              generationData.names?.find(
                (n: GenerationName) => n.language.name === lang,
              )?.name ?? genInfo.name;
            const generationNumber =
              parseInt(genInfo.name.split("-")[1] ?? "0") || 0;
            return {
              originalName: genInfo.name,
              translatedName: translatedName,
              generationNumber: generationNumber,
            };
          },
        ),
      );
      return translatedGenerations.sort(
        (a, b) => a.generationNumber - b.generationNumber,
      );
    }),
});
async function getAllPokemonData(allPokemonNames: string[]) {
  let allPokemonsData: Pokedex.Pokemon[] = [];
  if (allPokemonNames.length > 0) {
    const results = await Promise.allSettled(
      allPokemonNames.map((name) => pokedexInstance.getPokemonByName(name)),
    );
    const allFetchedPokemons = results
      .filter(
        (result): result is PromiseFulfilledResult<Pokedex.Pokemon> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
    allPokemonsData = structuredClone(allFetchedPokemons);
  }
  return allPokemonsData;
}
