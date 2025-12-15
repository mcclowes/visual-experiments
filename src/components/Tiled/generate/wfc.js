/**
 * Wave Function Collapse (WFC) Algorithm
 *
 * A constraint-satisfaction procedural generation algorithm that generates
 * output based on adjacency rules derived from sample patterns.
 *
 * This implementation includes backtracking to handle contradictions properly
 * instead of defaulting to empty tiles.
 */

import { TILES } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';
import { keepLargestRegion, placeStartEnd } from '../utils/connectivity';

// Adjacency rules: which tiles can be next to which
// Format: { tileType: { direction: [allowedTiles] } }
const ADJACENCY_RULES = {
  [TILES.WALL]: {
    north: [TILES.WALL, TILES.FLOOR, TILES.CORRIDOR],
    south: [TILES.WALL, TILES.FLOOR, TILES.CORRIDOR],
    east: [TILES.WALL, TILES.FLOOR, TILES.CORRIDOR],
    west: [TILES.WALL, TILES.FLOOR, TILES.CORRIDOR]
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
  [TILES.CORRIDOR]: {
    north: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    south: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    east: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL],
    west: [TILES.CORRIDOR, TILES.FLOOR, TILES.DOOR, TILES.WALL]
  }
};

// Weights for tile selection (affects probability)
const TILE_WEIGHTS = {
  [TILES.WALL]: 2,
  [TILES.FLOOR]: 5,
  [TILES.DOOR]: 1,
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
 * Deep clone a grid state for backtracking
 */
const cloneGrid = (grid) => {
  return grid.map(row => row.map(cell => ({
    ...cell,
    options: [...cell.options]
  })));
};

/**
 * Create initial superposition state for each cell
 */
const createSuperposition = (width, height) => {
  const grid = [];
  const allTiles = [TILES.WALL, TILES.FLOOR, TILES.DOOR, TILES.CORRIDOR];

  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      // Border tiles are forced to WALL
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        grid[y][x] = { collapsed: true, options: [TILES.WALL], tile: TILES.WALL };
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
const findLowestEntropyCell = (grid, rng) => {
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

  return candidates.length > 0 ? rng.randomItem(candidates) : null;
};

/**
 * Collapse a cell to a single tile based on weighted probability
 * Returns the chosen tile, or null if contradiction
 */
const collapseCell = (cell, rng) => {
  if (cell.options.length === 0) {
    return null; // Contradiction
  }

  // Weighted random selection
  const weightedOptions = cell.options.map(tile => ({
    value: tile,
    weight: TILE_WEIGHTS[tile] || 1
  }));

  const chosen = rng.weightedPick(weightedOptions);
  cell.tile = chosen;
  cell.collapsed = true;
  cell.options = [chosen];

  return chosen;
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
 * Returns false if a contradiction is found
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
          return false; // Contradiction found
        } else if (newOptions.length === 1) {
          neighbor.tile = newOptions[0];
          neighbor.collapsed = true;
        }
        stack.push({ x: nx, y: ny });
      }
    }
  }

  return true; // No contradiction
};

/**
 * Main WFC algorithm with backtracking
 *
 * @param {number} tiles - Grid size
 * @param {object} options - Generation options
 * @param {number} [options.seed] - Random seed
 * @param {number} [options.maxBacktracks=100] - Maximum backtrack attempts
 * @param {boolean} [options.ensureConnected=true] - Ensure single connected region
 * @param {boolean} [options.placeMarkers=false] - Place start/end markers
 * @returns {{grid: number[][], seed: number, stats: object}}
 */
const generateWFC = (tiles, options = {}) => {
  const {
    seed,
    maxBacktracks = 100,
    ensureConnected = true,
    placeMarkers = false
  } = options;

  const rng = createRandomUtils(seed);
  let grid = createSuperposition(tiles, tiles);
  let backtracks = 0;

  // History stack for backtracking
  const history = [];

  // Seed some initial floor tiles in the center
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

  let iterations = 0;
  const maxIterations = tiles * tiles * 3;

  while (iterations < maxIterations) {
    iterations++;

    // Find cell with lowest entropy
    const cellCoord = findLowestEntropyCell(grid, rng);

    // If no cell found, we're done
    if (!cellCoord) break;

    // Save state before collapse for potential backtracking
    history.push({
      grid: cloneGrid(grid),
      coord: cellCoord
    });

    // Limit history size to prevent memory issues
    if (history.length > maxBacktracks * 2) {
      history.splice(0, history.length - maxBacktracks);
    }

    // Collapse the cell
    const cell = grid[cellCoord.y][cellCoord.x];
    const chosen = collapseCell(cell, rng);

    if (chosen === null) {
      // Contradiction during collapse - backtrack
      if (history.length > 0 && backtracks < maxBacktracks) {
        const prev = history.pop();
        grid = prev.grid;
        // Remove the option that led to contradiction
        const prevCell = grid[prev.coord.y][prev.coord.x];
        if (prevCell.options.length > 1) {
          // Try a different option next time
          prevCell.options = prevCell.options.slice(1);
        }
        backtracks++;
        continue;
      }
      break;
    }

    // Propagate constraints
    const success = propagate(grid, cellCoord.x, cellCoord.y);

    if (!success) {
      // Contradiction during propagation - backtrack
      if (history.length > 0 && backtracks < maxBacktracks) {
        const prev = history.pop();
        grid = prev.grid;
        // Remove the option that led to contradiction
        const prevCell = grid[prev.coord.y][prev.coord.x];
        if (prevCell.options.length > 1) {
          prevCell.options = prevCell.options.slice(1);
        }
        backtracks++;
        continue;
      }
      break;
    }
  }

  // Convert to simple number grid
  let resultGrid = grid.map(row => row.map(cell => {
    if (!cell.collapsed) {
      return cell.options.length > 0 ? cell.options[0] : TILES.WALL;
    }
    return cell.tile;
  }));

  // Ensure connectivity
  if (ensureConnected) {
    keepLargestRegion(resultGrid);
  }

  // Place markers
  let markers = { start: null, end: null };
  if (placeMarkers) {
    markers = placeStartEnd(resultGrid, rng);
  }

  return {
    grid: resultGrid,
    seed: rng.seed,
    stats: {
      iterations,
      backtracks,
      markers
    }
  };
};

// Default export for backward compatibility
export default (tiles, options = {}) => {
  const result = generateWFC(tiles, options);
  return result.grid;
};

export { generateWFC };
