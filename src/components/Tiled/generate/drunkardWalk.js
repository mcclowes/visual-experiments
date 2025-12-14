import { randomNumber, randomItem } from "../utils/random";

/**
 * Drunkard's Walk Algorithm
 *
 * A simple random walk algorithm that creates organic, cave-like spaces
 * by having a "drunk" walker carve through a solid grid.
 *
 * The walker moves randomly in cardinal directions, creating passages
 * until a target percentage of the grid is carved out.
 */

// Tile types
const TILES = {
  WALL: 0,
  FLOOR: 1
};

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
    .fill(0)
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
const walkDrunk = (grid, startX, startY, targetFloors, width, height) => {
  let x = startX;
  let y = startY;
  let stepsWithoutCarving = 0;
  const maxStepsWithoutCarving = width * height;

  while (countFloors(grid) < targetFloors && stepsWithoutCarving < maxStepsWithoutCarving) {
    // Carve current position
    if (grid[y][x] === TILES.WALL) {
      grid[y][x] = TILES.FLOOR;
      stepsWithoutCarving = 0;
    } else {
      stepsWithoutCarving++;
    }

    // Pick random direction
    const dir = randomItem(DIRECTIONS);
    const newX = x + dir.dx;
    const newY = y + dir.dy;

    // Move if in bounds
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
const multipleWalkers = (grid, numWalkers, targetFloors, width, height) => {
  const walkerSteps = Math.ceil(targetFloors / numWalkers);

  for (let i = 0; i < numWalkers; i++) {
    // Start from a random floor tile or center
    let startX, startY;

    if (countFloors(grid) === 0) {
      startX = Math.floor(width / 2);
      startY = Math.floor(height / 2);
    } else {
      // Find a random floor tile to start from
      const floorTiles = [];
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (grid[y][x] === TILES.FLOOR) {
            floorTiles.push({ x, y });
          }
        }
      }
      const start = randomItem(floorTiles);
      startX = start.x;
      startY = start.y;
    }

    walkDrunk(grid, startX, startY, countFloors(grid) + walkerSteps, width, height);
  }

  return grid;
};

/**
 * Weighted walk - bias direction towards less carved areas
 */
const weightedWalk = (grid, startX, startY, targetFloors, width, height) => {
  let x = startX;
  let y = startY;
  let steps = 0;
  const maxSteps = width * height * 4;

  while (countFloors(grid) < targetFloors && steps < maxSteps) {
    steps++;

    // Carve current position
    grid[y][x] = TILES.FLOOR;

    // Calculate weights for each direction based on wall neighbors
    const weights = DIRECTIONS.map(dir => {
      const newX = x + dir.dx;
      const newY = y + dir.dy;

      if (!isInBounds(newX, newY, width, height)) return 0;

      // Count walls in a 3x3 area around the target
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

      // Higher weight for areas with more walls (unexplored)
      return wallCount + 1;
    });

    // Weighted random selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) break;

    let random = Math.random() * totalWeight;
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
 * @param {number} tiles - Grid size
 * @param {object} options - Configuration options
 */
const generateDrunkardWalk = (tiles, options = {}) => {
  const {
    fillPercentage = 0.45,      // Target percentage of floor tiles
    variant = "weighted",       // "simple", "multiple", or "weighted"
    numWalkers = 4              // Number of walkers for "multiple" variant
  } = options;

  const width = tiles;
  const height = tiles;
  const grid = createSolidGrid(width, height);
  const targetFloors = Math.floor(width * height * fillPercentage);

  // Starting position (center)
  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);

  switch (variant) {
    case "simple":
      walkDrunk(grid, startX, startY, targetFloors, width, height);
      break;
    case "multiple":
      multipleWalkers(grid, numWalkers, targetFloors, width, height);
      break;
    case "weighted":
    default:
      weightedWalk(grid, startX, startY, targetFloors, width, height);
      break;
  }

  return grid;
};

export default generateDrunkardWalk;
