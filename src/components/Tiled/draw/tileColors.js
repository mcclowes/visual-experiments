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

// Maze palette
export const mazePalette = {
  0: "#1a1a2e",      // Wall - dark navy
  1: "#eee8d5",      // Passage - light cream
  2: "#2ecc71",      // Start - green
  3: "#e74c3c"       // End - red
};

// WFC palette (more varied)
export const wfcPalette = {
  0: "#2c3e50",      // Empty - dark blue-gray
  1: "#ecf0f1",      // Floor - off-white
  2: "#e67e22",      // Door - orange
  3: "#8e44ad",      // Wall - purple
  4: "#bdc3c7"       // Corridor - light gray
};

/**
 * Get the appropriate palette for a generator type
 */
export const getPalette = generatorType => {
  switch (generatorType) {
    case "perlin":
      return terrainPalette;
    case "maze":
    case "maze-prims":
    case "maze-division":
      return mazePalette;
    case "wfc":
      return wfcPalette;
    case "caves":
    case "bsp":
    case "drunkard":
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
