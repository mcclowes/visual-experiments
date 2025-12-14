import { randomItem } from "../utils/random";

/**
 * Maze Generation using Recursive Backtracking
 *
 * A classic depth-first search algorithm that creates perfect mazes
 * (mazes with exactly one path between any two points).
 *
 * Also includes variants like Prim's algorithm and recursive division.
 */

// Tile types (4 and 5 for start/end to avoid conflict with door types 2/3)
const TILES = {
  WALL: 0,
  PASSAGE: 1,
  START: 4,
  END: 5
};

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
    .fill(0)
    .map(() => Array(width).fill(TILES.WALL));
};

/**
 * Shuffle array in place (Fisher-Yates)
 */
const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
const recursiveBacktracking = (grid, startX, startY) => {
  const width = grid[0].length;
  const height = grid.length;
  const stack = [{ x: startX, y: startY }];

  grid[startY][startX] = TILES.PASSAGE;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { x, y } = current;

    // Get unvisited neighbors
    const unvisitedNeighbors = shuffle([...DIRECTIONS]).filter(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      return (
        isInBounds(nx, ny, width, height) &&
        grid[ny][nx] === TILES.WALL
      );
    });

    if (unvisitedNeighbors.length === 0) {
      // Backtrack
      stack.pop();
    } else {
      // Choose a random unvisited neighbor
      const dir = unvisitedNeighbors[0];
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      const wx = x + dir.wx;
      const wy = y + dir.wy;

      // Carve passage
      grid[wy][wx] = TILES.PASSAGE;
      grid[ny][nx] = TILES.PASSAGE;

      // Add new cell to stack
      stack.push({ x: nx, y: ny });
    }
  }

  return grid;
};

/**
 * Prim's Algorithm
 * Creates a maze with a different character - tends to have shorter dead ends
 */
const primsAlgorithm = (grid, startX, startY) => {
  const width = grid[0].length;
  const height = grid.length;
  const frontier = [];

  // Mark starting cell as passage
  grid[startY][startX] = TILES.PASSAGE;

  // Add walls adjacent to starting cell to frontier
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
    // Pick random frontier cell
    const index = Math.floor(Math.random() * frontier.length);
    const cell = frontier[index];
    frontier.splice(index, 1);

    if (grid[cell.y][cell.x] === TILES.WALL) {
      // Carve passage
      grid[cell.wy][cell.wx] = TILES.PASSAGE;
      grid[cell.y][cell.x] = TILES.PASSAGE;

      // Add new frontier cells
      addFrontier(cell.x, cell.y);
    }
  }

  return grid;
};

/**
 * Recursive Division Algorithm
 * Starts with an open area and adds walls
 */
const recursiveDivision = (grid, x, y, width, height, orientation) => {
  if (width < 3 || height < 3) return;

  const horizontal = orientation === "horizontal";

  // Where to draw the wall
  let wx, wy;
  if (horizontal) {
    wy = y + (Math.floor(Math.random() * ((height - 2) / 2)) * 2 + 1);
    wx = x;
  } else {
    wx = x + (Math.floor(Math.random() * ((width - 2) / 2)) * 2 + 1);
    wy = y;
  }

  // Where to put the passage
  let px, py;
  if (horizontal) {
    px = x + (Math.floor(Math.random() * (width / 2)) * 2);
    py = wy;
  } else {
    px = wx;
    py = y + (Math.floor(Math.random() * (height / 2)) * 2);
  }

  // Draw the wall
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

  // Recurse
  if (horizontal) {
    const topHeight = wy - y;
    const bottomHeight = height - topHeight - 1;

    const nextOrientation = width > topHeight * 1.5 ? "vertical" : "horizontal";
    recursiveDivision(grid, x, y, width, topHeight, nextOrientation);

    const nextOrientation2 = width > bottomHeight * 1.5 ? "vertical" : "horizontal";
    recursiveDivision(grid, x, wy + 1, width, bottomHeight, nextOrientation2);
  } else {
    const leftWidth = wx - x;
    const rightWidth = width - leftWidth - 1;

    const nextOrientation = height > leftWidth * 1.5 ? "horizontal" : "vertical";
    recursiveDivision(grid, x, y, leftWidth, height, nextOrientation);

    const nextOrientation2 = height > rightWidth * 1.5 ? "horizontal" : "vertical";
    recursiveDivision(grid, wx + 1, y, rightWidth, height, nextOrientation2);
  }

  return grid;
};

/**
 * Add start and end points to maze
 */
const addStartEnd = (grid) => {
  const height = grid.length;
  const width = grid[0].length;

  // Find first and last passages
  let startFound = false;
  let endFound = false;

  // Start from top-left area
  for (let y = 1; y < height - 1 && !startFound; y++) {
    for (let x = 1; x < width - 1 && !startFound; x++) {
      if (grid[y][x] === TILES.PASSAGE) {
        grid[y][x] = TILES.START;
        startFound = true;
      }
    }
  }

  // End from bottom-right area
  for (let y = height - 2; y > 0 && !endFound; y--) {
    for (let x = width - 2; x > 0 && !endFound; x--) {
      if (grid[y][x] === TILES.PASSAGE) {
        grid[y][x] = TILES.END;
        endFound = true;
      }
    }
  }

  return grid;
};

/**
 * Create loops in the maze (imperfect maze)
 */
const addLoops = (grid, loopChance = 0.1) => {
  const height = grid.length;
  const width = grid[0].length;

  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      if (grid[y][x] === TILES.WALL && Math.random() < loopChance) {
        grid[y][x] = TILES.PASSAGE;
      }
    }
  }

  return grid;
};

/**
 * Main maze generator
 */
const generateMaze = (tiles, options = {}) => {
  const {
    algorithm = "backtracking",  // "backtracking", "prims", or "division"
    addStartEndMarkers = true,   // Add start/end markers
    loopChance = 0,              // Chance to add loops (0 = perfect maze)
    openness = 0                 // Additional random passage removal
  } = options;

  // Ensure odd dimensions for proper maze
  const width = tiles % 2 === 0 ? tiles - 1 : tiles;
  const height = tiles % 2 === 0 ? tiles - 1 : tiles;

  let grid;

  if (algorithm === "division") {
    // Recursive division starts with open space
    grid = Array(tiles)
      .fill(0)
      .map((_, y) =>
        Array(tiles)
          .fill(0)
          .map((_, x) => {
            // Border walls
            if (x === 0 || y === 0 || x === tiles - 1 || y === tiles - 1) {
              return TILES.WALL;
            }
            return TILES.PASSAGE;
          })
      );

    const orientation = width > height ? "vertical" : "horizontal";
    recursiveDivision(grid, 1, 1, tiles - 2, tiles - 2, orientation);
  } else {
    // Other algorithms start with solid walls
    grid = createSolidGrid(tiles, tiles);

    // Ensure starting point is on odd coordinates
    const startX = 1;
    const startY = 1;

    if (algorithm === "prims") {
      primsAlgorithm(grid, startX, startY);
    } else {
      recursiveBacktracking(grid, startX, startY);
    }
  }

  // Add loops if requested
  if (loopChance > 0) {
    addLoops(grid, loopChance);
  }

  // Add random openness
  if (openness > 0) {
    for (let y = 1; y < tiles - 1; y++) {
      for (let x = 1; x < tiles - 1; x++) {
        if (grid[y][x] === TILES.WALL && Math.random() < openness) {
          grid[y][x] = TILES.PASSAGE;
        }
      }
    }
  }

  // Add start and end markers
  if (addStartEndMarkers) {
    addStartEnd(grid);
  }

  return grid;
};

export default generateMaze;
