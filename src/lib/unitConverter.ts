// The PokeAPI provides height in decimeters and weight in hectograms.

/**
 * Converts height from decimeters to meters (SI) or feet and inches (Imperial).
 * @param heightInDecimeters - The height in decimeters.
 * @param unit - The target unit system ('si' or 'imperial').
 * @returns A formatted string with the converted height and unit.
 */
export const convertHeight = (
  heightInDecimeters: number,
  unit: "si" | "imperial",
): string => {
  if (unit === "si") {
    const meters = heightInDecimeters / 10;
    return `${meters.toFixed(1)} m`;
  } else {
    const inches = heightInDecimeters * 3.93701;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}' ${remainingInches}"`;
  }
};

/**
 * Converts weight from hectograms to kilograms (SI) or pounds (Imperial).
 * @param weightInHectograms - The weight in hectograms.
 * @param unit - The target unit system ('si' or 'imperial').
 * @returns A formatted string with the converted weight and unit.
 */
export const convertWeight = (
  weightInHectograms: number,
  unit: "si" | "imperial",
): string => {
  if (unit === "si") {
    const kilograms = weightInHectograms / 10;
    return `${kilograms.toFixed(1)} kg`;
  } else {
    const pounds = weightInHectograms * 0.220462;
    return `${pounds.toFixed(1)} lbs`;
  }
};
