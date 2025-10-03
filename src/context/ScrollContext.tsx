"use client";

import React, {
  createContext,
  useContext,
  useRef,
  type RefObject,
} from "react";

type ScrollContextType = {
  scrollElementRef: RefObject<HTMLElement | null>;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollElementRef = useRef<HTMLElement>(null);

  return (
    <ScrollContext.Provider value={{ scrollElementRef }}>
      <main
        ref={scrollElementRef}
        id="main-scroll"
        className="flex-grow overflow-auto"
      >
        {children}
      </main>
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};
