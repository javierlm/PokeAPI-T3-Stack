"use client";

import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";

export function PokemonSound({ cryUrl }: { cryUrl: string | undefined }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    if (audioRef.current) {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
  };

  if (!cryUrl) {
    return null;
  }

  return (
    <div>
      <button
        onClick={playSound}
        disabled={isPlaying}
        className="rounded-full p-2 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
      >
        <Volume2 className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      <audio ref={audioRef} src={cryUrl} preload="none" onEnded={onEnded} />
    </div>
  );
}
