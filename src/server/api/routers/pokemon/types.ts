import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";

export const types = publicProcedure
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
  });
