/**
 * Shared tile type constants used across all generators and renderers
 */

export const TILES = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  SECRET_DOOR: 3,
  START: 4,
  END: 5,
  CORRIDOR: 6
};

// Terrain-specific tile types (for Perlin generator)
export const TERRAIN = {
  DEEP_WATER: 0,
  WATER: 1,
  SAND: 2,
  GRASS: 3,
  FOREST: 4,
  MOUNTAIN: 5
};

// Tile metadata for UI and validation
export const TILE_INFO = {
  [TILES.WALL]: { name: 'Wall', walkable: false, symbol: '#' },
  [TILES.FLOOR]: { name: 'Floor', walkable: true, symbol: '.' },
  [TILES.DOOR]: { name: 'Door', walkable: true, symbol: '+' },
  [TILES.SECRET_DOOR]: { name: 'Secret Door', walkable: true, symbol: 'S' },
  [TILES.START]: { name: 'Start', walkable: true, symbol: '@' },
  [TILES.END]: { name: 'End', walkable: true, symbol: 'X' },
  [TILES.CORRIDOR]: { name: 'Corridor', walkable: true, symbol: ',' }
};

export const TERRAIN_INFO = {
  [TERRAIN.DEEP_WATER]: { name: 'Deep Water', walkable: false },
  [TERRAIN.WATER]: { name: 'Water', walkable: false },
  [TERRAIN.SAND]: { name: 'Sand', walkable: true },
  [TERRAIN.GRASS]: { name: 'Grass', walkable: true },
  [TERRAIN.FOREST]: { name: 'Forest', walkable: true },
  [TERRAIN.MOUNTAIN]: { name: 'Mountain', walkable: false }
};

/**
 * Check if a tile type is walkable
 */
export const isWalkable = (tileType, isTerrain = false) => {
  const info = isTerrain ? TERRAIN_INFO[tileType] : TILE_INFO[tileType];
  return info ? info.walkable : false;
};

/**
 * Check if a tile type is a floor-like tile (for connectivity checks)
 */
export const isFloorLike = (tileType) => {
  return [TILES.FLOOR, TILES.DOOR, TILES.SECRET_DOOR, TILES.START, TILES.END, TILES.CORRIDOR].includes(tileType);
};
