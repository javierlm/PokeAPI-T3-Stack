import pokedexInstance from "@/server/pokedex";
import type Pokedex from "pokedex-promise-v2";

export const getTranslatedName = (
  names: { language: { name: string }; name: string }[] | undefined,
  lang: string,
  fallbackName: string,
): string => {
  return names?.find((n) => n.language.name === lang)?.name ?? fallbackName;
};

type EvolutionChainLink = {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
};

export const extractEvolutionDetails = async (
  chainLink: EvolutionChainLink,
  lang: string,
): Promise<
  { id: number; name: string; translatedName: string; image: string }[]
> => {
  const pokemonName = chainLink.species.name;
  const pokemonData = await pokedexInstance.getPokemonByName(pokemonName);
  const speciesData =
    await pokedexInstance.getPokemonSpeciesByName(pokemonName);
  const translatedName = getTranslatedPokemonName(
    speciesData,
    pokemonData,
    lang,
  );
  const imageUrl = pokemonData.sprites?.front_default ?? "";
  const pokemonId = pokemonData.id;

  const details = [
    { id: pokemonId, name: pokemonName, translatedName, image: imageUrl },
  ];

  const evolutionDetails = await Promise.all(
    chainLink.evolves_to.map((evolution) =>
      extractEvolutionDetails(evolution, lang),
    ),
  );

  return details.concat(...evolutionDetails);
};

export const getEvolutions = async (
  species: Pokedex.PokemonSpecies,
  lang: string,
): Promise<
  { id: number; name: string; translatedName: string; image: string }[]
> => {
  if (species.evolution_chain?.url) {
    try {
      const evolutionChain = (await pokedexInstance.getResource(
        species.evolution_chain.url,
      )) as Pokedex.EvolutionChain;

      return await extractEvolutionDetails(evolutionChain.chain, lang);
    } catch (error) {
      console.error("Error fetching evolution chain for detail page:", error);
      return [];
    }
  }
  return [];
};

export const getTranslatedPokemonName = (
  species: Pokedex.PokemonSpecies,
  pokemon: Pokedex.Pokemon,
  lang: string,
): string => {
  return getTranslatedName(species.names, lang, pokemon.name);
};

export const getTranslatedGeneration = async (
  species: Pokedex.PokemonSpecies,
  lang: string,
): Promise<string> => {
  const generationData = await pokedexInstance.getGenerationByName(
    species.generation.name,
  );
  return getTranslatedName(generationData.names, lang, species.generation.name);
};

export const getTranslatedTypes = async (
  pokemon: Pokedex.Pokemon,
  lang: string,
): Promise<string[]> => {
  return await Promise.all(
    pokemon.types.map(async (typeInfo: Pokedex.PokemonType) => {
      const typeData = await pokedexInstance.getTypeByName(typeInfo.type.name);
      return getTranslatedName(typeData.names, lang, typeInfo.type.name);
    }),
  );
};

export const getPokemonDescription = (
  species: Pokedex.PokemonSpecies,
  lang: string,
): string => {
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

  return flavorTextEntry
    ? flavorTextEntry.flavor_text.replace(/\n/g, " ")
    : "No description available.";
};

export const getTranslatedStats = async (
  pokemon: Pokedex.Pokemon,
  lang: string,
) => {
  return await Promise.all(
    pokemon.stats.map(async (stat: Pokedex.StatElement) => {
      const statData = await pokedexInstance.getStatByName(stat.stat.name);
      const translatedStatName = getTranslatedName(
        statData.names,
        lang,
        stat.stat.name,
      );
      return {
        stat: {
          originalName: stat.stat.name,
          translatedName: translatedStatName,
        },
        value: stat.base_stat ?? 0,
      };
    }),
  );
};

export const getCandidatePokemons = async (
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

export async function getAllPokemonData(allPokemonNames: string[]) {
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

export const getEnrichedPokemonData = async (
  pokemon: Pokedex.Pokemon,
  lang: string,
) => {
  const species = await pokedexInstance.getPokemonSpeciesByName(
    pokemon.species.name,
  );

  const [generation, types, name] = await Promise.all([
    getTranslatedGeneration(species, lang),
    getTranslatedTypes(pokemon, lang),
    getTranslatedPokemonName(species, pokemon, lang),
  ]);

  return {
    id: pokemon.id,
    name,
    generation,
    types,
    image: pokemon.sprites?.front_default ?? "",
  };
};
