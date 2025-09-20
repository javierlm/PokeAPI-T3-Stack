import pokedexInstance from "@/server/pokedex";
import type Pokedex from "pokedex-promise-v2";

type EvolutionChainLink = {
  species: { name: string; url: string };
  evolves_to: EvolutionChainLink[];
};

export const extractEvolutionDetails = async (
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

export const getEvolutions = async (
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
