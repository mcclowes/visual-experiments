/**
 * Seeded random number generator utilities
 *
 * Uses mulberry32 PRNG for reproducible random sequences
 */

/**
 * Create a seeded random number generator using mulberry32 algorithm
 * @param {number} seed - The seed value
 * @returns {function} A function that returns random numbers between 0 and 1
 */
export const createRNG = (seed) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Generate a random seed from current time and Math.random
 * @returns {number} A random seed value
 */
export const generateSeed = () => {
  return Math.floor(Math.random() * 2147483647) + Date.now() % 1000000;
};

/**
 * Create a random utility object with seeded functions
 * @param {number} [seed] - Optional seed (generates one if not provided)
 * @returns {object} Object with random utility functions
 */
export const createRandomUtils = (seed) => {
  const actualSeed = seed ?? generateSeed();
  const rng = createRNG(actualSeed);

  return {
    seed: actualSeed,

    /**
     * Get next random number between 0 and 1
     */
    random: rng,

    /**
     * Get random item from array
     * @param {Array} list - Array to pick from
     * @returns {*} Random item from the array
     */
    randomItem: (list) => {
      const index = Math.floor(rng() * list.length);
      return list[index];
    },

    /**
     * Get random integer in range [min, max] (inclusive)
     * @param {number} max - Maximum value
     * @param {number} min - Minimum value (default 1)
     * @returns {number} Random integer
     */
    randomNumber: (max = 2, min = 1) => {
      return Math.floor(rng() * (max - min + 1) + min);
    },

    /**
     * Get random float in range [min, max)
     * @param {number} max - Maximum value
     * @param {number} min - Minimum value (default 0)
     * @returns {number} Random float
     */
    randomFloat: (max = 1, min = 0) => {
      return rng() * (max - min) + min;
    },

    /**
     * Shuffle array in place using Fisher-Yates
     * @param {Array} array - Array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffle: (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    /**
     * Return true with given probability
     * @param {number} probability - Probability (0 to 1)
     * @returns {boolean}
     */
    chance: (probability) => {
      return rng() < probability;
    },

    /**
     * Pick from weighted options
     * @param {Array<{value: *, weight: number}>} options - Weighted options
     * @returns {*} Selected value
     */
    weightedPick: (options) => {
      const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
      let random = rng() * totalWeight;

      for (const option of options) {
        random -= option.weight;
        if (random <= 0) {
          return option.value;
        }
      }
      return options[options.length - 1].value;
    }
  };
};

// Legacy exports for backward compatibility (use unseeded Math.random)
export const randomItem = list => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

export const randomNumber = (max = 2, min = 1) =>
  Math.floor(Math.random() * (max - min + 1) + min);
