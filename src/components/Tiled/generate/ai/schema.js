/**
 * AI Map Generation Schema
 *
 * This module defines the structured vocabulary and schema that enables
 * the AI to understand, design, and generate maps from natural language descriptions.
 *
 * The schema provides:
 * 1. Tile vocabulary with semantic meanings
 * 2. Spatial concepts for layout understanding
 * 3. Feature primitives for common map elements
 * 4. Validation rules for generated maps
 */

// =============================================================================
// TILE VOCABULARY
// =============================================================================

/**
 * Core tile types that map to the rendering system.
 * Each tile has semantic meaning the AI uses to understand map structure.
 */
export const TILE_TYPES = {
  // Structural tiles
  WALL: {
    id: 0,
    name: 'wall',
    description: 'Impassable barrier, edge of rooms, boundary of the map',
    semantic: 'blocking, boundary, solid, dark',
    usage: 'Surrounds rooms, creates barriers, defines map edges'
  },
  FLOOR: {
    id: 1,
    name: 'floor',
    description: 'Walkable open space inside rooms',
    semantic: 'open, traversable, interior, light',
    usage: 'Main walkable area inside rooms and chambers'
  },
  DOOR: {
    id: 2,
    name: 'door',
    description: 'Passage between rooms, connection point',
    semantic: 'transition, connection, threshold, passage',
    usage: 'Connects rooms, placed in walls between spaces'
  },
  SECRET_DOOR: {
    id: 3,
    name: 'secret_door',
    description: 'Hidden passage, concealed connection',
    semantic: 'hidden, secret, concealed, special',
    usage: 'For hidden passages and secret areas'
  },
  START: {
    id: 4,
    name: 'start',
    description: 'Entry point, beginning location',
    semantic: 'entrance, beginning, spawn, origin',
    usage: 'Where players or viewers begin'
  },
  END: {
    id: 5,
    name: 'end',
    description: 'Exit point, goal location, destination',
    semantic: 'exit, goal, destination, finish',
    usage: 'Final destination or exit point'
  },
  CORRIDOR: {
    id: 4,  // Rendered same as floor but semantically distinct
    name: 'corridor',
    description: 'Narrow passage connecting rooms',
    semantic: 'narrow, connecting, passage, hallway',
    usage: 'Connects rooms with thin walkable paths'
  }
};

/**
 * Terrain tiles for outdoor/natural maps
 */
export const TERRAIN_TYPES = {
  DEEP_WATER: {
    id: 0,
    name: 'deep_water',
    description: 'Deep water, ocean, lake center',
    semantic: 'water, deep, impassable, blue'
  },
  WATER: {
    id: 1,
    name: 'water',
    description: 'Shallow water, rivers, ponds',
    semantic: 'water, shallow, possibly passable, light blue'
  },
  SAND: {
    id: 2,
    name: 'sand',
    description: 'Beach, desert, dry land',
    semantic: 'shore, beach, dry, tan'
  },
  GRASS: {
    id: 3,
    name: 'grass',
    description: 'Plains, meadows, open land',
    semantic: 'vegetation, open, green, fertile'
  },
  FOREST: {
    id: 4,
    name: 'forest',
    description: 'Dense trees, woodland',
    semantic: 'trees, dense, dark green, cover'
  },
  MOUNTAIN: {
    id: 5,
    name: 'mountain',
    description: 'High elevation, rocky terrain',
    semantic: 'elevation, rocky, impassable, gray'
  }
};

// =============================================================================
// SPATIAL CONCEPTS
// =============================================================================

/**
 * Spatial relationships the AI uses to understand layout descriptions
 */
export const SPATIAL_CONCEPTS = {
  // Positions
  positions: {
    center: 'Middle of the map (x: 50%, y: 50%)',
    north: 'Top of the map (y: 0-30%)',
    south: 'Bottom of the map (y: 70-100%)',
    east: 'Right side of the map (x: 70-100%)',
    west: 'Left side of the map (x: 0-30%)',
    northeast: 'Top-right corner',
    northwest: 'Top-left corner',
    southeast: 'Bottom-right corner',
    southwest: 'Bottom-left corner'
  },

  // Relative positioning
  relative: {
    adjacent: 'Directly next to, sharing an edge',
    near: 'Close but not touching, 1-3 tiles apart',
    far: 'Distant, opposite ends of map',
    surrounding: 'Encircling on all sides',
    between: 'In the middle of two features'
  },

  // Sizes
  sizes: {
    tiny: '2-3 tiles (3-5 cells)',
    small: '4-6 tiles (6-10 cells)',
    medium: '7-10 tiles (11-20 cells)',
    large: '11-15 tiles (21-40 cells)',
    huge: '16+ tiles (40+ cells)',
    narrow: '1-2 tiles wide',
    wide: '3+ tiles wide'
  },

  // Shapes
  shapes: {
    square: 'Equal width and height',
    rectangular: 'Width differs from height',
    circular: 'Round approximation',
    L_shaped: 'Two connected rectangles at angle',
    T_shaped: 'Three-way intersection shape',
    irregular: 'Organic, non-geometric shape'
  }
};

// =============================================================================
// FEATURE PRIMITIVES
// =============================================================================

/**
 * Common map feature templates the AI can instantiate.
 * Each feature is a reusable pattern with parameters.
 */
export const FEATURE_PRIMITIVES = {
  // Room types
  rooms: {
    chamber: {
      description: 'Standard rectangular room',
      params: ['width', 'height', 'position'],
      defaultSize: { width: 5, height: 5 }
    },
    hall: {
      description: 'Large open rectangular space',
      params: ['width', 'height', 'position'],
      defaultSize: { width: 10, height: 8 }
    },
    corridor: {
      description: 'Narrow connecting passage',
      params: ['length', 'direction', 'start', 'end'],
      defaultWidth: 1
    },
    alcove: {
      description: 'Small indented space off a larger room',
      params: ['size', 'parentRoom', 'direction'],
      defaultSize: { width: 2, height: 2 }
    },
    circular_room: {
      description: 'Round chamber',
      params: ['radius', 'position'],
      defaultRadius: 4
    }
  },

  // Structural features
  structures: {
    pillar: {
      description: 'Single wall tile within a room',
      params: ['position'],
      size: { width: 1, height: 1 }
    },
    pillar_row: {
      description: 'Line of pillars',
      params: ['start', 'end', 'spacing'],
      defaultSpacing: 3
    },
    wall_section: {
      description: 'Partial wall dividing space',
      params: ['start', 'end', 'gaps']
    },
    platform: {
      description: 'Raised section (rendered as different floor)',
      params: ['bounds', 'height']
    }
  },

  // Connectors
  connectors: {
    door: {
      description: 'Standard door between rooms',
      params: ['position', 'orientation']
    },
    double_door: {
      description: 'Wide entrance',
      params: ['position', 'orientation', 'width']
    },
    archway: {
      description: 'Open passage without door',
      params: ['position', 'orientation', 'width']
    },
    secret_passage: {
      description: 'Hidden connection',
      params: ['position', 'orientation']
    }
  },

  // Special areas
  special: {
    entrance: {
      description: 'Map entry point with start marker',
      params: ['position', 'facing']
    },
    exit: {
      description: 'Map exit point with end marker',
      params: ['position']
    },
    treasure_room: {
      description: 'Special room for valuables',
      params: ['position', 'size', 'hidden']
    }
  }
};

// =============================================================================
// MAP ARCHETYPES
// =============================================================================

/**
 * Common location archetypes the AI recognizes.
 * These help translate high-level descriptions into map structures.
 */
export const LOCATION_ARCHETYPES = {
  dungeon: {
    description: 'Underground complex with rooms and corridors',
    typical_features: ['multiple rooms', 'connecting corridors', 'doors', 'hidden areas'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR', 'CORRIDOR', 'SECRET_DOOR'],
    structure: 'rooms connected by narrow passages'
  },
  castle: {
    description: 'Fortified structure with defensive layout',
    typical_features: ['great hall', 'throne room', 'towers', 'thick walls', 'grand entrance'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR', 'CORRIDOR'],
    structure: 'central keep with surrounding rooms'
  },
  cave: {
    description: 'Natural underground formation',
    typical_features: ['irregular shapes', 'winding passages', 'open caverns', 'dead ends'],
    tile_palette: ['WALL', 'FLOOR'],
    structure: 'organic, flowing spaces'
  },
  temple: {
    description: 'Religious or ceremonial structure',
    typical_features: ['central altar', 'symmetrical layout', 'entrance hall', 'side chambers'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR', 'CORRIDOR'],
    structure: 'symmetrical with central focus'
  },
  tavern: {
    description: 'Inn or public house',
    typical_features: ['common room', 'bar area', 'private rooms', 'kitchen', 'storage'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR'],
    structure: 'large central room with smaller attached rooms'
  },
  prison: {
    description: 'Holding facility with cells',
    typical_features: ['cells', 'guard room', 'central corridor', 'heavy doors'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR', 'CORRIDOR'],
    structure: 'grid of small rooms along corridors'
  },
  maze: {
    description: 'Labyrinthine structure',
    typical_features: ['twisting passages', 'dead ends', 'hidden paths', 'center goal'],
    tile_palette: ['WALL', 'FLOOR', 'CORRIDOR'],
    structure: 'complex interconnected passages'
  },
  mansion: {
    description: 'Large residential structure',
    typical_features: ['grand foyer', 'multiple bedrooms', 'dining hall', 'study', 'library'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR', 'CORRIDOR'],
    structure: 'organized rooms with logical flow'
  },
  library: {
    description: 'Archive or collection space',
    typical_features: ['shelving rows', 'reading areas', 'rare book room', 'study nooks'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR'],
    structure: 'rows of shelves with open areas'
  },
  arena: {
    description: 'Combat or performance space',
    typical_features: ['central pit', 'surrounding seating', 'preparation rooms', 'grand entrance'],
    tile_palette: ['WALL', 'FLOOR', 'DOOR'],
    structure: 'large central area with peripheral rooms'
  }
};

// =============================================================================
// OUTPUT SCHEMA
// =============================================================================

/**
 * The schema for AI-generated map output.
 * This is what the AI produces and what the system validates.
 */
export const OUTPUT_SCHEMA = {
  type: 'object',
  required: ['grid', 'metadata'],
  properties: {
    grid: {
      type: 'array',
      description: 'The 2D array of tile IDs (32x32 by default)',
      items: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 0,
          maximum: 5
        }
      }
    },
    metadata: {
      type: 'object',
      description: 'Information about the generated map',
      properties: {
        interpretation: {
          type: 'string',
          description: 'How the AI interpreted the prompt'
        },
        features: {
          type: 'array',
          description: 'List of features placed on the map',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              name: { type: 'string' },
              position: { type: 'object' },
              size: { type: 'object' }
            }
          }
        },
        archetype: {
          type: 'string',
          description: 'The primary location archetype used'
        }
      }
    }
  }
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates that a generated grid is properly formed
 */
export const validateGrid = (grid, expectedSize = 32) => {
  const errors = [];

  if (!Array.isArray(grid)) {
    errors.push('Grid must be an array');
    return { valid: false, errors };
  }

  if (grid.length !== expectedSize) {
    errors.push(`Grid must have ${expectedSize} rows, got ${grid.length}`);
  }

  for (let y = 0; y < grid.length; y++) {
    if (!Array.isArray(grid[y])) {
      errors.push(`Row ${y} must be an array`);
      continue;
    }
    if (grid[y].length !== expectedSize) {
      errors.push(`Row ${y} must have ${expectedSize} columns, got ${grid[y].length}`);
    }
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (!Number.isInteger(tile) || tile < 0 || tile > 5) {
        errors.push(`Invalid tile at (${x}, ${y}): ${tile}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Ensures the map has proper boundaries (walls on edges)
 */
export const ensureBoundaries = (grid) => {
  const height = grid.length;
  const width = grid[0]?.length || 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        grid[y][x] = TILE_TYPES.WALL.id;
      }
    }
  }

  return grid;
};

/**
 * Checks if the map has at least one connected region
 */
export const hasConnectedRegion = (grid) => {
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // Find first floor tile
  let startX = -1, startY = -1;
  for (let y = 0; y < height && startY === -1; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== TILE_TYPES.WALL.id) {
        startX = x;
        startY = y;
        break;
      }
    }
  }

  if (startY === -1) return false; // No walkable tiles

  // Flood fill to count connected tiles
  const visited = new Set();
  const queue = [{ x: startX, y: startY }];
  let count = 0;

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (grid[y][x] === TILE_TYPES.WALL.id) continue;

    visited.add(key);
    count++;

    queue.push({ x: x + 1, y });
    queue.push({ x: x - 1, y });
    queue.push({ x, y: y + 1 });
    queue.push({ x, y: y - 1 });
  }

  return count > 0;
};

export default {
  TILE_TYPES,
  TERRAIN_TYPES,
  SPATIAL_CONCEPTS,
  FEATURE_PRIMITIVES,
  LOCATION_ARCHETYPES,
  OUTPUT_SCHEMA,
  validateGrid,
  ensureBoundaries,
  hasConnectedRegion
};
