import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import {
  getEvolutions,
  getPokemonDescription,
  getTranslatedGeneration,
  getTranslatedPokemonName,
  getTranslatedStats,
  getTranslatedTypes,
} from "../pokemonUtils";

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

    const [
      generation,
      types,
      name,
      description,
      translatedStats,
      evolutionChainData,
    ] = await Promise.all([
      getTranslatedGeneration(species, lang),
      getTranslatedTypes(pokemon, lang),
      getTranslatedPokemonName(species, pokemon, lang),
      getPokemonDescription(species, lang),
      getTranslatedStats(pokemon, lang),
      getEvolutions(species, lang),
    ]);

    return {
      stats: translatedStats,
      id: pokemon.id,
      name,
      generation,
      types,
      image: pokemon.sprites?.front_default ?? "",
      shinyImage: pokemon.sprites?.front_shiny ?? "",
      cries: pokemon.cries,
      description,
      evolutionChain: evolutionChainData,
      weight: pokemon.weight,
      height: pokemon.height,
    };
  });
