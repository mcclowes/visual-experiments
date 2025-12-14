import { randomItem } from "../utils/random";

/**
 * Wave Function Collapse (WFC) Algorithm
 *
 * A constraint-satisfaction procedural generation algorithm that generates
 * output based on adjacency rules derived from sample patterns.
 *
 * This implementation uses a simple tile-based WFC with predefined adjacency rules
 * for dungeon/map generation.
 */

// Tile types
const TILES = {
  EMPTY: 0,
  FLOOR: 1,
  DOOR: 2,
  WALL: 3,
  CORRIDOR: 4
};

// Adjacency rules: which tiles can be next to which
// Format: { tileType: { direction: [allowedTiles] } }
const ADJACENCY_RULES = {
  [TILES.EMPTY]: {
    north: [TILES.EMPTY, TILES.WALL],
    south: [TILES.EMPTY, TILES.WALL],
    east: [TILES.EMPTY, TILES.WALL],
    west: [TILES.EMPTY, TILES.WALL]
  },
  [TILES.FLOOR]: {
    north: [TILES.FLOOR, TILES.WALL, TILES.DOOR, TILES.CORRIDOR],
    south: [TILES.FLOOR, TILES.WALL, TILES.DOOR, TILES.CORRIDOR],
    east: [TILES.FLOOR, TILES.WALL, TILES.DOOR, TILES.CORRIDOR],
    west: [TILES.FLOOR, TILES.WALL, TILES.DOOR, TILES.CORRIDOR]
  },
  [TILES.DOOR]: {
    north: [TILES.FLOOR, TILES.CORRIDOR],
    south: [TILES.FLOOR, TILES.CORRIDOR],
    east: [TILES.FLOOR, TILES.CORRIDOR],
    west: [TILES.FLOOR, TILES.CORRIDOR]
  },
  [TILES.WALL]: {
    north: [TILES.EMPTY, TILES.WALL, TILES.FLOOR],
    south: [TILES.EMPTY, TILES.WALL, TILES.FLOOR],
    east: [TILES.EMPTY, TILES.WALL, TILES.FLOOR],
    west: [TILES.EMPTY, TILES.WALL, TILES.FLOOR]
  },
  [TILES.CORRIDOR]: {
    north: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    south: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    east: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    west: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL]
  }
};

// Weights for tile selection (affects probability)
const TILE_WEIGHTS = {
  [TILES.EMPTY]: 2,
  [TILES.FLOOR]: 5,
  [TILES.DOOR]: 1,
  [TILES.WALL]: 3,
  [TILES.CORRIDOR]: 3
};

// Direction offsets
const DIRECTIONS = {
  north: { dx: 0, dy: -1, opposite: "south" },
  south: { dx: 0, dy: 1, opposite: "north" },
  east: { dx: 1, dy: 0, opposite: "west" },
  west: { dx: -1, dy: 0, opposite: "east" }
};

/**
 * Create initial superposition state for each cell
 * Each cell starts with all possible tiles
 */
const createSuperposition = (width, height) => {
  const grid = [];
  const allTiles = Object.values(TILES);

  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      // Border tiles are forced to EMPTY
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        grid[y][x] = { collapsed: true, options: [TILES.EMPTY], tile: TILES.EMPTY };
      } else {
        grid[y][x] = { collapsed: false, options: [...allTiles], tile: null };
      }
    }
  }

  return grid;
};

/**
 * Calculate entropy (number of possibilities) for a cell
 */
const getEntropy = cell => {
  if (cell.collapsed) return Infinity;
  return cell.options.length;
};

/**
 * Find the cell with lowest entropy (most constrained)
 */
const findLowestEntropyCell = grid => {
  let minEntropy = Infinity;
  let candidates = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const entropy = getEntropy(grid[y][x]);
      if (entropy < minEntropy && entropy > 0) {
        minEntropy = entropy;
        candidates = [{ x, y }];
      } else if (entropy === minEntropy) {
        candidates.push({ x, y });
      }
    }
  }

  // Return random candidate among those with lowest entropy
  return candidates.length > 0 ? randomItem(candidates) : null;
};

/**
 * Collapse a cell to a single tile based on weighted probability
 */
const collapseCell = cell => {
  if (cell.options.length === 0) {
    // Contradiction - default to EMPTY
    cell.tile = TILES.EMPTY;
    cell.collapsed = true;
    return;
  }

  // Weighted random selection
  const weights = cell.options.map(tile => TILE_WEIGHTS[tile] || 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < cell.options.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      cell.tile = cell.options[i];
      cell.collapsed = true;
      cell.options = [cell.options[i]];
      return;
    }
  }

  // Fallback
  cell.tile = cell.options[0];
  cell.collapsed = true;
  cell.options = [cell.tile];
};

/**
 * Get valid tiles for a neighbor based on adjacency rules
 */
const getValidNeighborTiles = (tile, direction) => {
  const rules = ADJACENCY_RULES[tile];
  return rules ? rules[direction] || [] : [];
};

/**
 * Propagate constraints to neighboring cells
 */
const propagate = (grid, x, y) => {
  const stack = [{ x, y }];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    const key = `${current.x},${current.y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const cell = grid[current.y][current.x];

    for (const [dirName, dir] of Object.entries(DIRECTIONS)) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      // Check bounds
      if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) {
        continue;
      }

      const neighbor = grid[ny][nx];
      if (neighbor.collapsed) continue;

      // Calculate valid tiles for neighbor based on current cell's possibilities
      let validTiles = new Set();
      for (const option of cell.options) {
        const allowed = getValidNeighborTiles(option, dirName);
        allowed.forEach(t => validTiles.add(t));
      }

      // Also check what the neighbor allows coming back
      const reverseValid = new Set();
      for (const option of neighbor.options) {
        const allowed = getValidNeighborTiles(option, dir.opposite);
        if (cell.options.some(t => allowed.includes(t))) {
          reverseValid.add(option);
        }
      }

      // Intersect with current options
      const newOptions = neighbor.options.filter(
        t => validTiles.has(t) && reverseValid.has(t)
      );

      // If options changed, propagate further
      if (newOptions.length < neighbor.options.length) {
        neighbor.options = newOptions;
        if (newOptions.length === 0) {
          // Contradiction - force to EMPTY
          neighbor.options = [TILES.EMPTY];
          neighbor.tile = TILES.EMPTY;
          neighbor.collapsed = true;
        } else if (newOptions.length === 1) {
          neighbor.tile = newOptions[0];
          neighbor.collapsed = true;
        }
        stack.push({ x: nx, y: ny });
      }
    }
  }
};

/**
 * Main WFC algorithm
 */
const generateWFC = tiles => {
  const grid = createSuperposition(tiles, tiles);
  let iterations = 0;
  const maxIterations = tiles * tiles * 2;

  // Seed some initial floor tiles in the center to encourage interesting patterns
  const centerX = Math.floor(tiles / 2);
  const centerY = Math.floor(tiles / 2);
  const seedRadius = Math.floor(tiles / 6);

  for (let dy = -seedRadius; dy <= seedRadius; dy++) {
    for (let dx = -seedRadius; dx <= seedRadius; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x > 0 && x < tiles - 1 && y > 0 && y < tiles - 1) {
        if (Math.abs(dx) + Math.abs(dy) <= seedRadius) {
          grid[y][x].options = [TILES.FLOOR, TILES.CORRIDOR];
        }
      }
    }
  }

  while (iterations < maxIterations) {
    iterations++;

    // Find cell with lowest entropy
    const cell = findLowestEntropyCell(grid);

    // If no cell found, we're done
    if (!cell) break;

    // Collapse that cell
    collapseCell(grid[cell.y][cell.x]);

    // Propagate constraints
    propagate(grid, cell.x, cell.y);
  }

  // Convert to simple number grid and ensure all cells are collapsed
  return grid.map(row => row.map(cell => {
    if (!cell.collapsed) {
      return cell.options.length > 0 ? cell.options[0] : TILES.EMPTY;
    }
    return cell.tile;
  }));
};

export default generateWFC;
