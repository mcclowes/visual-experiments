/**
 * Perlin Noise Terrain Generator
 *
 * Uses Perlin noise to generate natural-looking terrain with smooth
 * transitions between different elevation levels.
 *
 * This implementation includes a classic Perlin noise algorithm with
 * octave-based fractal noise for more detailed terrain.
 */

import { TERRAIN } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';

/**
 * Create permutation table for Perlin noise
 * Uses seeded RNG for reproducibility
 */
const createPermutationTable = (rng) => {
  const p = [];
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Fisher-Yates shuffle with seeded RNG
  rng.shuffle(p);

  // Duplicate the permutation table
  const perm = new Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }

  return perm;
};

/**
 * Fade function for smooth interpolation
 * 6t^5 - 15t^4 + 10t^3
 */
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Linear interpolation
 */
const lerp = (a, b, t) => a + t * (b - a);

/**
 * Gradient function - returns dot product of distance and gradient vectors
 */
const grad = (hash, x, y) => {
  const h = hash & 3;
  switch (h) {
    case 0: return x + y;
    case 1: return -x + y;
    case 2: return x - y;
    case 3: return -x - y;
    default: return 0;
  }
};

/**
 * 2D Perlin noise
 */
const perlin2D = (x, y, perm) => {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);

  return lerp(x1, x2, v);
};

/**
 * Fractal/Octave Perlin noise
 */
const fractalNoise = (x, y, perm, options = {}) => {
  const {
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2,
    scale = 0.05
  } = options;

  let total = 0;
  let frequency = scale;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += perlin2D(x * frequency, y * frequency, perm) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return (total / maxValue + 1) / 2;
};

/**
 * Map noise value to terrain type
 */
const noiseToTerrain = (value, options = {}) => {
  const {
    waterLevel = 0.35,
    sandLevel = 0.4,
    grassLevel = 0.6,
    forestLevel = 0.75
  } = options;

  if (value < waterLevel - 0.1) return TERRAIN.DEEP_WATER;
  if (value < waterLevel) return TERRAIN.WATER;
  if (value < sandLevel) return TERRAIN.SAND;
  if (value < grassLevel) return TERRAIN.GRASS;
  if (value < forestLevel) return TERRAIN.FOREST;
  return TERRAIN.MOUNTAIN;
};

/**
 * Island mask - makes terrain more island-like
 */
const islandMask = (x, y, width, height, falloff = 1.5) => {
  const centerX = width / 2;
  const centerY = height / 2;

  const dx = (x - centerX) / centerX;
  const dy = (y - centerY) / centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return Math.max(0, 1 - Math.pow(dist, falloff));
};

/**
 * Generate terrain heightmap using Perlin noise
 */
const generateHeightmap = (width, height, perm, options = {}) => {
  const heightmap = [];

  for (let y = 0; y < height; y++) {
    heightmap[y] = [];
    for (let x = 0; x < width; x++) {
      let noise = fractalNoise(x, y, perm, options);

      if (options.islandMode) {
        const mask = islandMask(x, y, width, height, options.islandFalloff);
        noise = noise * mask;
      }

      heightmap[y][x] = noise;
    }
  }

  return heightmap;
};

/**
 * Convert heightmap to terrain grid
 */
const heightmapToTerrain = (heightmap, options = {}) => {
  return heightmap.map(row =>
    row.map(value => noiseToTerrain(value, options))
  );
};

/**
 * Apply erosion simulation (simplified)
 */
const applyErosion = (heightmap, iterations = 3) => {
  const height = heightmap.length;
  const width = heightmap[0].length;

  for (let iter = 0; iter < iterations; iter++) {
    const newMap = heightmap.map(row => [...row]);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const neighbors = [
          heightmap[y - 1][x],
          heightmap[y + 1][x],
          heightmap[y][x - 1],
          heightmap[y][x + 1]
        ];
        const avg = neighbors.reduce((a, b) => a + b, 0) / 4;
        newMap[y][x] = heightmap[y][x] * 0.8 + avg * 0.2;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        heightmap[y][x] = newMap[y][x];
      }
    }
  }

  return heightmap;
};

/**
 * Main Perlin noise terrain generator
 *
 * @param {number} tiles - Grid size
 * @param {object} options - Configuration options
 * @param {number} [options.seed] - Random seed for reproducibility
 * @param {number} [options.scale=0.08] - Noise scale (smaller = larger features)
 * @param {number} [options.octaves=4] - Number of noise octaves
 * @param {number} [options.persistence=0.5] - Amplitude decrease per octave
 * @param {number} [options.lacunarity=2] - Frequency increase per octave
 * @param {number} [options.waterLevel=0.35] - Water threshold
 * @param {number} [options.sandLevel=0.4] - Sand threshold
 * @param {number} [options.grassLevel=0.6] - Grass threshold
 * @param {number} [options.forestLevel=0.75] - Forest threshold
 * @param {boolean} [options.islandMode=true] - Apply island mask
 * @param {number} [options.islandFalloff=1.8] - Island mask falloff
 * @param {number} [options.erosionIterations=2] - Erosion passes
 * @returns {{grid: number[][], seed: number, heightmap: number[][], stats: object}}
 */
const generatePerlin = (tiles, options = {}) => {
  const {
    seed,
    scale = 0.08,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2,
    waterLevel = 0.35,
    sandLevel = 0.4,
    grassLevel = 0.6,
    forestLevel = 0.75,
    islandMode = true,
    islandFalloff = 1.8,
    erosionIterations = 2
  } = options;

  const rng = createRandomUtils(seed);
  const width = tiles;
  const height = tiles;

  // Create permutation table with seeded RNG
  const perm = createPermutationTable(rng);

  // Generate heightmap
  let heightmap = generateHeightmap(width, height, perm, {
    scale,
    octaves,
    persistence,
    lacunarity,
    islandMode,
    islandFalloff
  });

  // Apply erosion
  if (erosionIterations > 0) {
    heightmap = applyErosion(heightmap, erosionIterations);
  }

  // Convert to terrain
  const terrain = heightmapToTerrain(heightmap, {
    waterLevel,
    sandLevel,
    grassLevel,
    forestLevel
  });

  // Calculate terrain distribution stats
  const stats = {
    water: 0,
    land: 0,
    mountain: 0
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrain[y][x];
      if (tile <= TERRAIN.WATER) stats.water++;
      else if (tile === TERRAIN.MOUNTAIN) stats.mountain++;
      else stats.land++;
    }
  }

  const totalTiles = width * height;

  return {
    grid: terrain,
    seed: rng.seed,
    heightmap,
    stats: {
      waterPercentage: (stats.water / totalTiles * 100).toFixed(1),
      landPercentage: (stats.land / totalTiles * 100).toFixed(1),
      mountainPercentage: (stats.mountain / totalTiles * 100).toFixed(1)
    }
  };
};

// Default export for backward compatibility
export default (tiles, options = {}) => {
  const result = generatePerlin(tiles, options);
  return result.grid;
};

export { generatePerlin, TERRAIN as PERLIN_TILES };
