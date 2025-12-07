import * as v from "valibot";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";
import { getTranslatedName } from "../pokemonUtils";

export const types = publicProcedure
  .input(v.object({ language: v.optional(v.string()) }))
  .query(async ({ input }) => {
    const lang = input.language ?? "es";
    const allTypes = await pokedexInstance.getTypesList();

    const translatedTypes = await Promise.all(
      allTypes.results.map(async (typeInfo: Pokedex.NamedAPIResource) => {
        const typeData = await pokedexInstance.getTypeByName(typeInfo.name);
        const translatedName = getTranslatedName(
          typeData.names,
          lang,
          typeInfo.name,
        );
        return {
          originalName: typeInfo.name,
          translatedName: translatedName,
        };
      }),
    );
    return translatedTypes;
  });
