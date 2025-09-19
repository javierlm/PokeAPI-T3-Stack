"use client";
import { SoundButton } from "@/app/_components/SoundButton";
import { Volume2, CassetteTape } from "lucide-react";

export function PokemonCries({
  latestCry,
  legacyCry,
}: {
  latestCry?: string;
  legacyCry?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <SoundButton cryUrl={latestCry}>
        <Volume2 className="text-foreground h-6 w-6" />
      </SoundButton>
      <SoundButton cryUrl={legacyCry}>
        <CassetteTape className="text-foreground h-6 w-6" />
      </SoundButton>
    </div>
  );
}
