/**
 * Color palette for Perlin terrain generator
 * (Dungeon-style generators use tile.js for unified rendering)
 */

// Terrain type constants
export const TERRAIN_TYPES = {
  DEEP_WATER: 0,
  WATER: 1,
  SAND: 2,
  GRASS: 3,
  FOREST: 4,
  MOUNTAIN: 5,
  SNOW: 6,
  SWAMP: 7,
  VOLCANIC: 8,
  PLAINS: 9,
  HILLS: 10
};

export const terrainPalette = {
  [TERRAIN_TYPES.DEEP_WATER]: "#1a4480",   // Deep water - dark blue
  [TERRAIN_TYPES.WATER]: "#4a90d9",        // Water - blue
  [TERRAIN_TYPES.SAND]: "#f4e4bc",         // Sand - sandy beige
  [TERRAIN_TYPES.GRASS]: "#7cb342",        // Grass - green
  [TERRAIN_TYPES.FOREST]: "#2e7d32",       // Forest - dark green
  [TERRAIN_TYPES.MOUNTAIN]: "#757575",     // Mountain - gray
  [TERRAIN_TYPES.SNOW]: "#e8f5e9",         // Snow - white with slight blue tint
  [TERRAIN_TYPES.SWAMP]: "#5d4037",        // Swamp - murky brown-green
  [TERRAIN_TYPES.VOLCANIC]: "#bf360c",     // Volcanic - deep red-orange
  [TERRAIN_TYPES.PLAINS]: "#aed581",       // Plains - light green
  [TERRAIN_TYPES.HILLS]: "#a1887f"         // Hills - tan/brown
};

/**
 * Get the terrain palette (only used by Perlin generators)
 */
export const getPalette = () => terrainPalette;
