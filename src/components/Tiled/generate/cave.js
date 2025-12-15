/**
 * Cellular Automata Cave Generator
 *
 * Uses the 4-5 rule to generate organic cave-like structures.
 * Reference: http://roguebasin.roguelikedevelopment.org/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
 */

import { TILES } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';
import { keepLargestRegion, connectRegions, placeStartEnd } from '../utils/connectivity';

const sq = radius => (radius * 2 + 1) ** 2;

/**
 * Count neighbors in a radius around a cell
 */
const sumLens = (grid, i, j, radius) => {
  let total = 0;
  const height = grid.length;
  const width = grid[0].length;

  for (let x = i - radius; x <= i + radius; x++) {
    for (let y = j - radius; y <= j + radius; y++) {
      if (x >= 0 && x < height && y >= 0 && y < width) {
        total += grid[x][y] === TILES.FLOOR ? 1 : 0;
      }
    }
  }

  return total;
};

/**
 * Apply 4-5 cellular automata rule
 * A cell becomes floor if it has >= 5 floor neighbors, or wall otherwise
 * Additionally, isolated cells (no neighbors in radius 2) become floor
 */
const apply45Switch = (grid, i, j) => {
  const isolated = sumLens(grid, i, j, 2) === 0;
  if (isolated) return TILES.FLOOR;

  const neighbors = sumLens(grid, i, j, 1);
  return neighbors >= 5 ? TILES.FLOOR : TILES.WALL;
};

/**
 * Apply the 4-5 rule to entire grid
 */
const apply45Rule = (grid) => {
  const height = grid.length;
  const width = grid[0].length;

  return grid.map((row, j) => {
    return row.map((_, i) => {
      // Keep borders as walls
      if (i === 0 || j === 0 || i === width - 1 || j === height - 1) {
        return TILES.WALL;
      }
      return apply45Switch(grid, j, i);
    });
  });
};

/**
 * Generate cave using cellular automata
 *
 * @param {number} tiles - Grid size (tiles x tiles)
 * @param {object} options - Generation options
 * @param {number} [options.seed] - Random seed for reproducibility
 * @param {number} [options.initialDensity=0.45] - Initial floor density (0-1)
 * @param {number} [options.iterations=3] - Number of CA iterations
 * @param {boolean} [options.ensureConnected=true] - Ensure single connected region
 * @param {boolean} [options.connectDisconnected=false] - Connect regions instead of removing
 * @param {boolean} [options.placeMarkers=false] - Place start/end markers
 * @returns {{grid: number[][], seed: number, stats: object}}
 */
const generateCaveCellularAutomata = (tiles, options = {}) => {
  const {
    seed,
    initialDensity = 0.45,
    iterations = 3,
    ensureConnected = true,
    connectDisconnected = false,
    placeMarkers = false
  } = options;

  const rng = createRandomUtils(seed);

  // Create initial random grid
  let grid = Array(tiles)
    .fill(null)
    .map(() =>
      Array(tiles)
        .fill(null)
        .map(() => rng.chance(initialDensity) ? TILES.FLOOR : TILES.WALL)
    );

  // Apply cellular automata rules
  for (let i = 0; i < iterations; i++) {
    grid = apply45Rule(grid);
  }

  // Ensure connectivity
  if (ensureConnected) {
    if (connectDisconnected) {
      connectRegions(grid);
    } else {
      keepLargestRegion(grid);
    }
  }

  // Place start and end markers
  let markers = { start: null, end: null };
  if (placeMarkers) {
    markers = placeStartEnd(grid, rng);
  }

  // Calculate stats
  let floorCount = 0;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      if (grid[y][x] !== TILES.WALL) floorCount++;
    }
  }

  return {
    grid,
    seed: rng.seed,
    stats: {
      floorPercentage: (floorCount / (tiles * tiles) * 100).toFixed(1),
      markers
    }
  };
};

// Default export returns just the grid for backward compatibility
export default (tiles, options = {}) => {
  const result = generateCaveCellularAutomata(tiles, options);
  return result.grid;
};

// Named export for full result with metadata
export { generateCaveCellularAutomata };
