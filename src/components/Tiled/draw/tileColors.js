/**
 * Color palette for Perlin terrain generator
 * (Dungeon-style generators use tile.js for unified rendering)
 */

export const terrainPalette = {
  0: "#1a4480",      // Deep water - dark blue
  1: "#4a90d9",      // Water - blue
  2: "#f4e4bc",      // Sand - sandy beige
  3: "#7cb342",      // Grass - green
  4: "#2e7d32",      // Forest - dark green
  5: "#9e9e9e"       // Mountain - gray
};

/**
 * Get the terrain palette (only used by Perlin generators)
 */
export const getPalette = () => terrainPalette;
