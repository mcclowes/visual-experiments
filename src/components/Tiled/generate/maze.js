/**
 * Maze Generation Algorithms
 *
 * Includes multiple maze generation algorithms:
 * - Recursive Backtracking (depth-first search)
 * - Prim's Algorithm
 * - Recursive Division
 *
 * Creates perfect mazes (exactly one path between any two points)
 * with optional loop creation for imperfect mazes.
 */

import { TILES } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';

// Directions with wall-carving offsets (move 2 cells at a time)
const DIRECTIONS = [
  { dx: 0, dy: -2, wx: 0, wy: -1 },  // North
  { dx: 0, dy: 2, wx: 0, wy: 1 },    // South
  { dx: 2, dy: 0, wx: 1, wy: 0 },    // East
  { dx: -2, dy: 0, wx: -1, wy: 0 }   // West
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
 * Check if position is within bounds
 */
const isInBounds = (x, y, width, height) => {
  return x >= 0 && x < width && y >= 0 && y < height;
};

/**
 * Recursive Backtracking Algorithm
 * Creates a perfect maze using depth-first search
 */
const recursiveBacktracking = (grid, startX, startY, rng) => {
  const width = grid[0].length;
  const height = grid.length;
  const stack = [{ x: startX, y: startY }];

  grid[startY][startX] = TILES.FLOOR;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { x, y } = current;

    // Get unvisited neighbors (shuffled)
    const directions = rng.shuffle([...DIRECTIONS]);
    const unvisitedNeighbors = directions.filter(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      return (
        isInBounds(nx, ny, width, height) &&
        grid[ny][nx] === TILES.WALL
      );
    });

    if (unvisitedNeighbors.length === 0) {
      stack.pop();
    } else {
      const dir = unvisitedNeighbors[0];
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      const wx = x + dir.wx;
      const wy = y + dir.wy;

      grid[wy][wx] = TILES.FLOOR;
      grid[ny][nx] = TILES.FLOOR;

      stack.push({ x: nx, y: ny });
    }
  }

  return grid;
};

/**
 * Prim's Algorithm
 * Creates a maze with shorter dead ends
 */
const primsAlgorithm = (grid, startX, startY, rng) => {
  const width = grid[0].length;
  const height = grid.length;
  const frontier = [];

  grid[startY][startX] = TILES.FLOOR;

  const addFrontier = (x, y) => {
    for (const dir of DIRECTIONS) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      const wx = x + dir.wx;
      const wy = y + dir.wy;

      if (
        isInBounds(nx, ny, width, height) &&
        grid[ny][nx] === TILES.WALL
      ) {
        frontier.push({ x: nx, y: ny, wx, wy, fromX: x, fromY: y });
      }
    }
  };

  addFrontier(startX, startY);

  while (frontier.length > 0) {
    const index = rng.randomNumber(frontier.length - 1, 0);
    const cell = frontier[index];
    frontier.splice(index, 1);

    if (grid[cell.y][cell.x] === TILES.WALL) {
      grid[cell.wy][cell.wx] = TILES.FLOOR;
      grid[cell.y][cell.x] = TILES.FLOOR;
      addFrontier(cell.x, cell.y);
    }
  }

  return grid;
};

/**
 * Recursive Division Algorithm
 * Starts with an open area and adds walls
 */
const recursiveDivision = (grid, x, y, width, height, orientation, rng) => {
  if (width < 3 || height < 3) return;

  const horizontal = orientation === "horizontal";

  let wx, wy;
  if (horizontal) {
    wy = y + (rng.randomNumber(Math.floor((height - 2) / 2), 0) * 2 + 1);
    wx = x;
  } else {
    wx = x + (rng.randomNumber(Math.floor((width - 2) / 2), 0) * 2 + 1);
    wy = y;
  }

  let px, py;
  if (horizontal) {
    px = x + (rng.randomNumber(Math.floor(width / 2) - 1, 0) * 2);
    py = wy;
  } else {
    px = wx;
    py = y + (rng.randomNumber(Math.floor(height / 2) - 1, 0) * 2);
  }

  if (horizontal) {
    for (let i = x; i < x + width; i++) {
      if (i !== px && wy >= 0 && wy < grid.length && i >= 0 && i < grid[0].length) {
        grid[wy][i] = TILES.WALL;
      }
    }
  } else {
    for (let i = y; i < y + height; i++) {
      if (i !== py && i >= 0 && i < grid.length && wx >= 0 && wx < grid[0].length) {
        grid[i][wx] = TILES.WALL;
      }
    }
  }

  if (horizontal) {
    const topHeight = wy - y;
    const bottomHeight = height - topHeight - 1;

    const nextOrientation = width > topHeight * 1.5 ? "vertical" : "horizontal";
    recursiveDivision(grid, x, y, width, topHeight, nextOrientation, rng);

    const nextOrientation2 = width > bottomHeight * 1.5 ? "vertical" : "horizontal";
    recursiveDivision(grid, x, wy + 1, width, bottomHeight, nextOrientation2, rng);
  } else {
    const leftWidth = wx - x;
    const rightWidth = width - leftWidth - 1;

    const nextOrientation = height > leftWidth * 1.5 ? "horizontal" : "vertical";
    recursiveDivision(grid, x, y, leftWidth, height, nextOrientation, rng);

    const nextOrientation2 = height > rightWidth * 1.5 ? "horizontal" : "vertical";
    recursiveDivision(grid, wx + 1, y, rightWidth, height, nextOrientation2, rng);
  }

  return grid;
};

/**
 * Add start and end points to maze
 */
const addStartEnd = (grid) => {
  const height = grid.length;
  const width = grid[0].length;

  let startFound = false;
  let endFound = false;
  let start = null;
  let end = null;

  for (let y = 1; y < height - 1 && !startFound; y++) {
    for (let x = 1; x < width - 1 && !startFound; x++) {
      if (grid[y][x] === TILES.FLOOR) {
        grid[y][x] = TILES.START;
        start = { x, y };
        startFound = true;
      }
    }
  }

  for (let y = height - 2; y > 0 && !endFound; y--) {
    for (let x = width - 2; x > 0 && !endFound; x--) {
      if (grid[y][x] === TILES.FLOOR) {
        grid[y][x] = TILES.END;
        end = { x, y };
        endFound = true;
      }
    }
  }

  return { start, end };
};

/**
 * Create loops in the maze (imperfect maze)
 */
const addLoops = (grid, loopChance, rng) => {
  const height = grid.length;
  const width = grid[0].length;

  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      if (grid[y][x] === TILES.WALL && rng.chance(loopChance)) {
        grid[y][x] = TILES.FLOOR;
      }
    }
  }

  return grid;
};

/**
 * Main maze generator
 *
 * @param {number} tiles - Grid size
 * @param {object} options - Configuration options
 * @param {number} [options.seed] - Random seed for reproducibility
 * @param {string} [options.algorithm="backtracking"] - "backtracking", "prims", or "division"
 * @param {boolean} [options.addStartEndMarkers=true] - Add start/end markers
 * @param {number} [options.loopChance=0] - Chance to add loops (0 = perfect maze)
 * @param {number} [options.openness=0] - Additional random passage removal
 * @returns {{grid: number[][], seed: number, stats: object}}
 */
const generateMaze = (tiles, options = {}) => {
  const {
    seed,
    algorithm = "backtracking",
    addStartEndMarkers = true,
    loopChance = 0,
    openness = 0
  } = options;

  const rng = createRandomUtils(seed);

  // Ensure odd dimensions for proper maze
  const width = tiles % 2 === 0 ? tiles - 1 : tiles;
  const height = tiles % 2 === 0 ? tiles - 1 : tiles;

  let grid;

  if (algorithm === "division") {
    grid = Array(tiles)
      .fill(null)
      .map((_, y) =>
        Array(tiles)
          .fill(null)
          .map((_, x) => {
            if (x === 0 || y === 0 || x === tiles - 1 || y === tiles - 1) {
              return TILES.WALL;
            }
            return TILES.FLOOR;
          })
      );

    const orientation = width > height ? "vertical" : "horizontal";
    recursiveDivision(grid, 1, 1, tiles - 2, tiles - 2, orientation, rng);
  } else {
    grid = createSolidGrid(tiles, tiles);

    const startX = 1;
    const startY = 1;

    if (algorithm === "prims") {
      primsAlgorithm(grid, startX, startY, rng);
    } else {
      recursiveBacktracking(grid, startX, startY, rng);
    }
  }

  // Add loops if requested
  if (loopChance > 0) {
    addLoops(grid, loopChance, rng);
  }

  // Add random openness
  if (openness > 0) {
    for (let y = 1; y < tiles - 1; y++) {
      for (let x = 1; x < tiles - 1; x++) {
        if (grid[y][x] === TILES.WALL && rng.chance(openness)) {
          grid[y][x] = TILES.FLOOR;
        }
      }
    }
  }

  // Add start and end markers
  let markers = { start: null, end: null };
  if (addStartEndMarkers) {
    markers = addStartEnd(grid);
  }

  return {
    grid,
    seed: rng.seed,
    stats: {
      algorithm,
      isPerfect: loopChance === 0 && openness === 0,
      markers
    }
  };
};

// Default export for backward compatibility
export default (tiles, options = {}) => {
  const result = generateMaze(tiles, options);
  return result.grid;
};

export { generateMaze };
