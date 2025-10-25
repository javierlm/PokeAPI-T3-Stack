/**
 * Generates a pseudorandom number between 0 and 1
 * using un mulberry32.
 *
 * @param seed - Seed for the generator.
 * @returns A pseudorandom number between 0 and 1.
 */

function mulberry32(seed: number) {
  let state = seed;
  return function () {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a pseudorandom number between min and max (inclusive)
 * using a mulberry32 generator.
 *
 * @param seed - Seed for the generator.
 * @param min - Minimum value (inclusive).
 * @param max - Maximum value (inclusive).
 * @returns A pseudorandom number.
 */
function nextInt(seed: number, min: number, max: number): number {
  const generator = mulberry32(seed);
  return Math.floor(generator() * (max - min + 1)) + min;
}

/**
 * Gets seed from date
 * @param date - Date received
 * @returns Integer based on the date to use as seed
 */
export function generateDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS uses 0 for January, so we need sum 1 for having the number in the range of 1-12
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Obtains the ID of Pokemon of the day based on the date
 * @param date - Date to determine Pokemon of that day
 * @param totalPokemonCount - Number of total Pokemon to use as max for the deterministic function
 * @returns ID of the Pokemon of the day
 */
export function getPokemonOfTheDay(
  date: Date,
  totalPokemonCount: number,
): number {
  const seed = generateDateSeed(date);
  return nextInt(seed, 1, totalPokemonCount);
}
