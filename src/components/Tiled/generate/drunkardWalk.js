/**
 * Drunkard's Walk Algorithm
 *
 * A simple random walk algorithm that creates organic, cave-like spaces
 * by having a "drunk" walker carve through a solid grid.
 *
 * The walker moves randomly in cardinal directions, creating passages
 * until a target percentage of the grid is carved out.
 */

import { TILES } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';
import { keepLargestRegion, placeStartEnd } from '../utils/connectivity';

// Direction offsets for cardinal movement
const DIRECTIONS = [
  { dx: 0, dy: -1 },  // North
  { dx: 0, dy: 1 },   // South
  { dx: 1, dy: 0 },   // East
  { dx: -1, dy: 0 }   // West
];

/**
 * Create a grid filled with walls
 */
const createSolidGrid = (width, height) => {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(TILES.WALL));
};

/**
 * Count the number of floor tiles
 */
const countFloors = grid => {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === TILES.FLOOR) count++;
    }
  }
  return count;
};

/**
 * Check if position is within bounds (excluding border)
 */
const isInBounds = (x, y, width, height) => {
  return x > 0 && x < width - 1 && y > 0 && y < height - 1;
};

/**
 * Perform a single drunkard's walk from a starting position
 */
const walkDrunk = (grid, startX, startY, targetFloors, width, height, rng) => {
  let x = startX;
  let y = startY;
  let stepsWithoutCarving = 0;
  const maxStepsWithoutCarving = width * height;

  while (countFloors(grid) < targetFloors && stepsWithoutCarving < maxStepsWithoutCarving) {
    if (grid[y][x] === TILES.WALL) {
      grid[y][x] = TILES.FLOOR;
      stepsWithoutCarving = 0;
    } else {
      stepsWithoutCarving++;
    }

    const dir = rng.randomItem(DIRECTIONS);
    const newX = x + dir.dx;
    const newY = y + dir.dy;

    if (isInBounds(newX, newY, width, height)) {
      x = newX;
      y = newY;
    }
  }

  return grid;
};

/**
 * Multiple walkers variant - spawn multiple drunkards
 */
const multipleWalkers = (grid, numWalkers, targetFloors, width, height, rng) => {
  const walkerSteps = Math.ceil(targetFloors / numWalkers);

  for (let i = 0; i < numWalkers; i++) {
    let startX, startY;

    if (countFloors(grid) === 0) {
      startX = Math.floor(width / 2);
      startY = Math.floor(height / 2);
    } else {
      const floorTiles = [];
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (grid[y][x] === TILES.FLOOR) {
            floorTiles.push({ x, y });
          }
        }
      }
      const start = rng.randomItem(floorTiles);
      startX = start.x;
      startY = start.y;
    }

    walkDrunk(grid, startX, startY, countFloors(grid) + walkerSteps, width, height, rng);
  }

  return grid;
};

/**
 * Weighted walk - bias direction towards less carved areas
 */
const weightedWalk = (grid, startX, startY, targetFloors, width, height, rng) => {
  let x = startX;
  let y = startY;
  let steps = 0;
  const maxSteps = width * height * 4;

  while (countFloors(grid) < targetFloors && steps < maxSteps) {
    steps++;

    grid[y][x] = TILES.FLOOR;

    const weights = DIRECTIONS.map(dir => {
      const newX = x + dir.dx;
      const newY = y + dir.dy;

      if (!isInBounds(newX, newY, width, height)) return 0;

      let wallCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const checkX = newX + dx;
          const checkY = newY + dy;
          if (
            checkX >= 0 &&
            checkX < width &&
            checkY >= 0 &&
            checkY < height &&
            grid[checkY][checkX] === TILES.WALL
          ) {
            wallCount++;
          }
        }
      }

      return wallCount + 1;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) break;

    let random = rng.random() * totalWeight;
    let selectedDir = DIRECTIONS[0];

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedDir = DIRECTIONS[i];
        break;
      }
    }

    const newX = x + selectedDir.dx;
    const newY = y + selectedDir.dy;

    if (isInBounds(newX, newY, width, height)) {
      x = newX;
      y = newY;
    }
  }

  return grid;
};

/**
 * Main Drunkard's Walk generator
 *
 * @param {number} tiles - Grid size
 * @param {object} options - Configuration options
 * @param {number} [options.seed] - Random seed for reproducibility
 * @param {number} [options.fillPercentage=0.45] - Target percentage of floor tiles
 * @param {string} [options.variant="weighted"] - "simple", "multiple", or "weighted"
 * @param {number} [options.numWalkers=4] - Number of walkers for "multiple" variant
 * @param {boolean} [options.ensureConnected=true] - Ensure single connected region
 * @param {boolean} [options.placeMarkers=false] - Place start/end markers
 * @returns {{grid: number[][], seed: number, stats: object}}
 */
const generateDrunkardWalk = (tiles, options = {}) => {
  const {
    seed,
    fillPercentage = 0.45,
    variant = "weighted",
    numWalkers = 4,
    ensureConnected = true,
    placeMarkers = false
  } = options;

  const rng = createRandomUtils(seed);
  const width = tiles;
  const height = tiles;
  const grid = createSolidGrid(width, height);
  const targetFloors = Math.floor(width * height * fillPercentage);

  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);

  switch (variant) {
    case "simple":
      walkDrunk(grid, startX, startY, targetFloors, width, height, rng);
      break;
    case "multiple":
      multipleWalkers(grid, numWalkers, targetFloors, width, height, rng);
      break;
    case "weighted":
    default:
      weightedWalk(grid, startX, startY, targetFloors, width, height, rng);
      break;
  }

  // Ensure connectivity
  if (ensureConnected) {
    keepLargestRegion(grid);
  }

  // Place markers
  let markers = { start: null, end: null };
  if (placeMarkers) {
    markers = placeStartEnd(grid, rng);
  }

  // Calculate stats
  const floorCount = countFloors(grid);

  return {
    grid,
    seed: rng.seed,
    stats: {
      floorPercentage: (floorCount / (tiles * tiles) * 100).toFixed(1),
      variant,
      markers
    }
  };
};

// Default export for backward compatibility
export default (tiles, options = {}) => {
  const result = generateDrunkardWalk(tiles, options);
  return result.grid;
};

export { generateDrunkardWalk };
