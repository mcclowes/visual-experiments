/**
 * Color palettes for different generator types
 * Each palette maps tile type numbers to colors
 */

// Default dungeon palette (for caves, WFC, BSP, etc.)
export const dungeonPalette = {
  0: "#2d2d2d",      // Wall/Empty - dark gray
  1: "#fefef4",      // Floor - light cream
  2: "#8b4513",      // Door - brown
  3: "#654321",      // Secret door - dark brown
  4: "#d4c4a8"       // Corridor - tan
};

// Perlin terrain palette
export const terrainPalette = {
  0: "#1a4480",      // Deep water - dark blue
  1: "#4a90d9",      // Water - blue
  2: "#f4e4bc",      // Sand - sandy beige
  3: "#7cb342",      // Grass - green
  4: "#2e7d32",      // Forest - dark green
  5: "#9e9e9e"       // Mountain - gray
};

// Maze palette (unified with dungeon style, but with distinct start/end markers)
export const mazePalette = {
  0: "#2d2d2d",      // Wall - dark gray (matches dungeon)
  1: "#fefef4",      // Passage - light cream (matches dungeon)
  2: "#4a7c4e",      // Start - muted green (harmonizes with dungeon)
  3: "#8b4513"       // End - brown (matches dungeon doors)
};

/**
 * Get the appropriate palette for a generator type
 */
export const getPalette = generatorType => {
  switch (generatorType) {
    case "perlin":
    case "perlin-continent":
      return terrainPalette;
    case "maze":
    case "maze-prims":
    case "maze-division":
    case "maze-imperfect":
      return mazePalette;
    // All dungeon-style generators use the same palette for visual consistency
    case "wfc":
    case "caves":
    case "bsp":
    case "drunkard":
    case "drunkard-simple":
    case "drunkard-multi":
    default:
      return dungeonPalette;
  }
};

/**
 * Get fill color for a tile
 */
export const getTileColor = (tileType, generatorType) => {
  const palette = getPalette(generatorType);
  return palette[tileType] || "#ff00ff"; // Magenta for unknown types
};
