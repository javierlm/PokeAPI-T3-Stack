import { z } from "zod";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import { getPokemonOfTheDay } from "@/lib/mulberry32";
import { getEnrichedPokemonData } from "../pokemonUtils";
import type PokeAPI from "pokedex-promise-v2";

export const pokemonOfTheDay = publicProcedure
  .input(
    z.object({
      date: z.string(),
      language: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const lang = input.language ?? "es";
    const date = new Date(input.date);

    const pokemonSpecies = await pokedexInstance.getPokemonSpeciesList({
      limit: 1,
    });
    const totalCount = pokemonSpecies.count;

    const pokemonId: number = getPokemonOfTheDay(date, totalCount);

    try {
      const pokemon: PokeAPI.Pokemon = await pokedexInstance.getPokemonByName(
        pokemonId.toString(),
      );

      const enrichedPokemon = await getEnrichedPokemonData(pokemon, lang);

      return {
        pokemon: {
          id: enrichedPokemon.id,
          name: enrichedPokemon.name,
          generation: enrichedPokemon.generation,
          types: enrichedPokemon.types,
          image: enrichedPokemon.image,
        },
        date: input.date,
      };
    } catch (error) {
      console.error(
        `Error fetching Pokemon of the day (ID: ${pokemonId}):`,
        error,
      );
      throw new Error("Error al obtener el Pokemon del día");
    }
  });
