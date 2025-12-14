/**
 * Perlin Noise Terrain Generator
 *
 * Uses Perlin noise to generate natural-looking terrain with smooth
 * transitions between different elevation levels.
 *
 * This implementation includes a classic Perlin noise algorithm with
 * octave-based fractal noise for more detailed terrain.
 */

// Tile types based on elevation
const TILES = {
  DEEP_WATER: 0,
  WATER: 1,
  SAND: 2,
  GRASS: 3,
  FOREST: 4,
  MOUNTAIN: 5
};

/**
 * Permutation table for Perlin noise
 * Classic implementation uses a shuffled array of 0-255
 */
const createPermutationTable = () => {
  const p = [];
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  // Fisher-Yates shuffle
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }

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
  // Find unit grid cell containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  // Get relative position within cell
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  // Compute fade curves
  const u = fade(xf);
  const v = fade(yf);

  // Hash coordinates of the 4 corners
  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];

  // Blend the gradients
  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);

  return lerp(x1, x2, v);
};

/**
 * Fractal/Octave Perlin noise
 * Combines multiple octaves for more natural-looking terrain
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

  // Normalize to 0-1
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

  if (value < waterLevel - 0.1) return TILES.DEEP_WATER;
  if (value < waterLevel) return TILES.WATER;
  if (value < sandLevel) return TILES.SAND;
  if (value < grassLevel) return TILES.GRASS;
  if (value < forestLevel) return TILES.FOREST;
  return TILES.MOUNTAIN;
};

/**
 * Island mask - makes terrain more island-like
 * Values closer to center are higher
 */
const islandMask = (x, y, width, height, falloff = 1.5) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

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

      // Apply island mask if enabled
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
 * Smooths terrain and creates more natural features
 */
const applyErosion = (heightmap, iterations = 3) => {
  const height = heightmap.length;
  const width = heightmap[0].length;

  for (let iter = 0; iter < iterations; iter++) {
    const newMap = heightmap.map(row => [...row]);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // Average with neighbors
        const neighbors = [
          heightmap[y - 1][x],
          heightmap[y + 1][x],
          heightmap[y][x - 1],
          heightmap[y][x + 1]
        ];
        const avg = neighbors.reduce((a, b) => a + b, 0) / 4;

        // Slight erosion towards neighbors
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
 */
const generatePerlin = (tiles, options = {}) => {
  const {
    scale = 0.08,           // Noise scale (smaller = larger features)
    octaves = 4,            // Number of noise octaves
    persistence = 0.5,      // Amplitude decrease per octave
    lacunarity = 2,         // Frequency increase per octave
    waterLevel = 0.35,      // Water threshold
    sandLevel = 0.4,        // Sand threshold
    grassLevel = 0.6,       // Grass threshold
    forestLevel = 0.75,     // Forest threshold
    islandMode = true,      // Apply island mask
    islandFalloff = 1.8,    // Island mask falloff
    erosionIterations = 2   // Erosion passes
  } = options;

  const width = tiles;
  const height = tiles;

  // Create permutation table (new random seed)
  const perm = createPermutationTable();

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

  return terrain;
};

export default generatePerlin;
export { TILES as PERLIN_TILES };
