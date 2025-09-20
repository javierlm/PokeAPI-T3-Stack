import { z } from "zod";
import type Pokedex from "pokedex-promise-v2";
import { publicProcedure } from "@/server/api/trpc";
import pokedexInstance from "@/server/pokedex";

export const generations = publicProcedure
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
  });
