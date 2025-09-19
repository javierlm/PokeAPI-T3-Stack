"use client";
import { useRef, useState } from "react";

export function SoundButton({
  cryUrl,
  children,
}: {
  cryUrl: string | undefined;
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = () => {
    if (audioRef.current) {
      void audioRef.current.play();
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
    <>
      <button
        onClick={playSound}
        disabled={isPlaying}
        className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:hover:bg-gray-700"
      >
        {children}
      </button>
      <audio ref={audioRef} src={cryUrl} preload="none" onEnded={onEnded} />
    </>
  );
}
