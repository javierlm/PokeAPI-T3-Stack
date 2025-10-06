"use client";

import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";

type Unit = "si" | "imperial";

interface UnitContextType {
  unit: Unit;
  toggleUnit: () => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider = ({ children }: { children: ReactNode }) => {
  const [unit, setUnit] = useState<Unit>("si");

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "si" ? "imperial" : "si"));
  };

  return (
    <UnitContext.Provider value={{ unit, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error("useUnit must be used within a UnitProvider");
  }
  return context;
};
