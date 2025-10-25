import { createTRPCRouter } from "@/server/api/trpc";
import { byId } from "./pokemon/byId";
import { generations } from "./pokemon/generations";
import { list } from "./pokemon/list";
import { types } from "./pokemon/types";
import { pokemonOfTheDay } from "./pokemon/pokemonOfTheDay";

export const pokemonRouter = createTRPCRouter({
  pokemonList: list,
  pokemonById: byId,
  getPokemonTypes: types,
  getPokemonGenerations: generations,
  pokemonOfTheDay: pokemonOfTheDay,
});
