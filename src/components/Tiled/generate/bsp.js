import { randomNumber } from "../utils/random";

/**
 * Binary Space Partitioning (BSP) Algorithm
 *
 * A classic dungeon generation algorithm that recursively divides space
 * into smaller partitions, places rooms within each partition, and
 * connects them with corridors.
 *
 * This creates well-structured dungeons with distinct rooms and corridors.
 */

// Tile types
const TILES = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  CORRIDOR: 4
};

/**
 * BSP Node representing a partition of space
 */
class BSPNode {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = null;
    this.right = null;
    this.room = null;
  }

  /**
   * Get the center of this node or its room
   */
  getCenter() {
    if (this.room) {
      return {
        x: this.room.x + Math.floor(this.room.width / 2),
        y: this.room.y + Math.floor(this.room.height / 2)
      };
    }
    return {
      x: this.x + Math.floor(this.width / 2),
      y: this.y + Math.floor(this.height / 2)
    };
  }

  /**
   * Get a room from this node or its children
   */
  getRoom() {
    if (this.room) return this.room;
    if (this.left) {
      const leftRoom = this.left.getRoom();
      if (leftRoom) return leftRoom;
    }
    if (this.right) {
      const rightRoom = this.right.getRoom();
      if (rightRoom) return rightRoom;
    }
    return null;
  }
}

/**
 * Create a grid filled with walls
 */
const createSolidGrid = (width, height) => {
  return Array(height)
    .fill(0)
    .map(() => Array(width).fill(TILES.WALL));
};

/**
 * Split a node into two children
 */
const splitNode = (node, minSize) => {
  // Already split
  if (node.left || node.right) return false;

  // Determine split direction
  // If too wide, split vertically. If too tall, split horizontally.
  let splitHorizontally = Math.random() > 0.5;

  if (node.width > node.height && node.width / node.height >= 1.25) {
    splitHorizontally = false;
  } else if (node.height > node.width && node.height / node.width >= 1.25) {
    splitHorizontally = true;
  }

  const max = (splitHorizontally ? node.height : node.width) - minSize;

  // Too small to split
  if (max <= minSize) return false;

  // Determine split position
  const split = randomNumber(max, minSize);

  if (splitHorizontally) {
    node.left = new BSPNode(node.x, node.y, node.width, split);
    node.right = new BSPNode(node.x, node.y + split, node.width, node.height - split);
  } else {
    node.left = new BSPNode(node.x, node.y, split, node.height);
    node.right = new BSPNode(node.x + split, node.y, node.width - split, node.height);
  }

  return true;
};

/**
 * Recursively split the BSP tree
 */
const buildTree = (node, minSize, maxDepth, currentDepth = 0) => {
  if (currentDepth >= maxDepth) return;

  if (splitNode(node, minSize)) {
    buildTree(node.left, minSize, maxDepth, currentDepth + 1);
    buildTree(node.right, minSize, maxDepth, currentDepth + 1);
  }
};

/**
 * Create rooms in leaf nodes
 */
const createRooms = (node, minRoomSize, padding) => {
  if (node.left || node.right) {
    // Not a leaf, recurse
    if (node.left) createRooms(node.left, minRoomSize, padding);
    if (node.right) createRooms(node.right, minRoomSize, padding);
    return;
  }

  // Leaf node - create a room
  const roomWidth = randomNumber(
    node.width - padding * 2,
    Math.min(minRoomSize, node.width - padding * 2)
  );
  const roomHeight = randomNumber(
    node.height - padding * 2,
    Math.min(minRoomSize, node.height - padding * 2)
  );

  const roomX = node.x + randomNumber(node.width - roomWidth - padding, padding);
  const roomY = node.y + randomNumber(node.height - roomHeight - padding, padding);

  node.room = {
    x: roomX,
    y: roomY,
    width: roomWidth,
    height: roomHeight
  };
};

/**
 * Draw a room on the grid
 */
const drawRoom = (grid, room) => {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = TILES.FLOOR;
      }
    }
  }
};

/**
 * Draw a corridor between two points
 */
const drawCorridor = (grid, x1, y1, x2, y2) => {
  // L-shaped corridor
  const horizontal = Math.random() > 0.5;

  if (horizontal) {
    // Horizontal first, then vertical
    drawHorizontalCorridor(grid, x1, x2, y1);
    drawVerticalCorridor(grid, y1, y2, x2);
  } else {
    // Vertical first, then horizontal
    drawVerticalCorridor(grid, y1, y2, x1);
    drawHorizontalCorridor(grid, x1, x2, y2);
  }
};

/**
 * Draw a horizontal corridor
 */
const drawHorizontalCorridor = (grid, x1, x2, y) => {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);

  for (let x = startX; x <= endX; x++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = TILES.CORRIDOR;
      }
    }
  }
};

/**
 * Draw a vertical corridor
 */
const drawVerticalCorridor = (grid, y1, y2, x) => {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);

  for (let y = startY; y <= endY; y++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = TILES.CORRIDOR;
      }
    }
  }
};

/**
 * Connect rooms with corridors
 */
const connectRooms = (grid, node) => {
  if (!node.left || !node.right) return;

  // Connect children first
  connectRooms(grid, node.left);
  connectRooms(grid, node.right);

  // Get rooms from left and right subtrees
  const leftRoom = node.left.getRoom();
  const rightRoom = node.right.getRoom();

  if (leftRoom && rightRoom) {
    // Connect the centers of the rooms
    const leftCenter = {
      x: leftRoom.x + Math.floor(leftRoom.width / 2),
      y: leftRoom.y + Math.floor(leftRoom.height / 2)
    };
    const rightCenter = {
      x: rightRoom.x + Math.floor(rightRoom.width / 2),
      y: rightRoom.y + Math.floor(rightRoom.height / 2)
    };

    drawCorridor(grid, leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
  }
};

/**
 * Draw all rooms on the grid
 */
const drawAllRooms = (grid, node) => {
  if (node.room) {
    drawRoom(grid, node.room);
  }
  if (node.left) drawAllRooms(grid, node.left);
  if (node.right) drawAllRooms(grid, node.right);
};

/**
 * Add doors where corridors meet rooms
 */
const addDoors = grid => {
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] === TILES.CORRIDOR) {
        // Check if this corridor tile is adjacent to a room
        const neighbors = [
          grid[y - 1][x],
          grid[y + 1][x],
          grid[y][x - 1],
          grid[y][x + 1]
        ];

        const hasFloor = neighbors.includes(TILES.FLOOR);
        const hasWall = neighbors.includes(TILES.WALL);

        // Door placement: corridor next to floor and wall (transition point)
        if (hasFloor && hasWall && Math.random() < 0.3) {
          grid[y][x] = TILES.DOOR;
        }
      }
    }
  }
};

/**
 * Main BSP dungeon generator
 */
const generateBSP = (tiles, options = {}) => {
  const {
    minPartitionSize = 6,  // Minimum partition size
    maxDepth = 4,          // Maximum BSP tree depth
    minRoomSize = 3,       // Minimum room size
    padding = 1,           // Padding between room and partition edge
    addDoorsEnabled = true // Whether to add doors
  } = options;

  const width = tiles;
  const height = tiles;
  const grid = createSolidGrid(width, height);

  // Create root node
  const root = new BSPNode(1, 1, width - 2, height - 2);

  // Build BSP tree
  buildTree(root, minPartitionSize, maxDepth);

  // Create rooms in leaf nodes
  createRooms(root, minRoomSize, padding);

  // Draw rooms
  drawAllRooms(grid, root);

  // Connect rooms with corridors
  connectRooms(grid, root);

  // Add doors
  if (addDoorsEnabled) {
    addDoors(grid);
  }

  return grid;
};

export default generateBSP;
