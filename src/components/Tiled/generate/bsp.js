/**
 * Binary Space Partitioning (BSP) Algorithm
 *
 * A classic dungeon generation algorithm that recursively divides space
 * into smaller partitions, places rooms within each partition, and
 * connects them with corridors.
 *
 * This creates well-structured dungeons with distinct rooms and corridors.
 */

import { TILES } from '../constants/tiles';
import { createRandomUtils } from '../utils/random';
import { checkConnectivity, connectRegions, placeStartEnd } from '../utils/connectivity';

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

  /**
   * Get all rooms in this subtree
   */
  getAllRooms() {
    const rooms = [];
    if (this.room) rooms.push(this.room);
    if (this.left) rooms.push(...this.left.getAllRooms());
    if (this.right) rooms.push(...this.right.getAllRooms());
    return rooms;
  }
}

/**
 * Create a grid filled with walls
 */
const createSolidGrid = (width, height) => {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(TILES.WALL));
};

/**
 * Split a node into two children
 */
const splitNode = (node, minSize, rng) => {
  if (node.left || node.right) return false;

  let splitHorizontally = rng.chance(0.5);

  if (node.width > node.height && node.width / node.height >= 1.25) {
    splitHorizontally = false;
  } else if (node.height > node.width && node.height / node.width >= 1.25) {
    splitHorizontally = true;
  }

  const max = (splitHorizontally ? node.height : node.width) - minSize;

  if (max <= minSize) return false;

  const split = rng.randomNumber(max, minSize);

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
const buildTree = (node, minSize, maxDepth, rng, currentDepth = 0) => {
  if (currentDepth >= maxDepth) return;

  if (splitNode(node, minSize, rng)) {
    buildTree(node.left, minSize, maxDepth, rng, currentDepth + 1);
    buildTree(node.right, minSize, maxDepth, rng, currentDepth + 1);
  }
};

/**
 * Create rooms in leaf nodes
 */
const createRooms = (node, minRoomSize, padding, rng) => {
  if (node.left || node.right) {
    if (node.left) createRooms(node.left, minRoomSize, padding, rng);
    if (node.right) createRooms(node.right, minRoomSize, padding, rng);
    return;
  }

  const maxRoomWidth = node.width - padding * 2;
  const maxRoomHeight = node.height - padding * 2;

  if (maxRoomWidth < minRoomSize || maxRoomHeight < minRoomSize) {
    return; // Partition too small for a room
  }

  const roomWidth = rng.randomNumber(maxRoomWidth, minRoomSize);
  const roomHeight = rng.randomNumber(maxRoomHeight, minRoomSize);

  const maxX = node.width - roomWidth - padding;
  const maxY = node.height - roomHeight - padding;

  const roomX = node.x + (maxX > padding ? rng.randomNumber(maxX, padding) : padding);
  const roomY = node.y + (maxY > padding ? rng.randomNumber(maxY, padding) : padding);

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
const drawCorridor = (grid, x1, y1, x2, y2, rng, corridorTile = TILES.CORRIDOR) => {
  const horizontal = rng.chance(0.5);

  if (horizontal) {
    drawHorizontalCorridor(grid, x1, x2, y1, corridorTile);
    drawVerticalCorridor(grid, y1, y2, x2, corridorTile);
  } else {
    drawVerticalCorridor(grid, y1, y2, x1, corridorTile);
    drawHorizontalCorridor(grid, x1, x2, y2, corridorTile);
  }
};

const drawHorizontalCorridor = (grid, x1, x2, y, corridorTile) => {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);

  for (let x = startX; x <= endX; x++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = corridorTile;
      }
    }
  }
};

const drawVerticalCorridor = (grid, y1, y2, x, corridorTile) => {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);

  for (let y = startY; y <= endY; y++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = corridorTile;
      }
    }
  }
};

/**
 * Connect rooms with corridors
 */
const connectRoomsInTree = (grid, node, rng) => {
  if (!node.left || !node.right) return;

  connectRoomsInTree(grid, node.left, rng);
  connectRoomsInTree(grid, node.right, rng);

  const leftRoom = node.left.getRoom();
  const rightRoom = node.right.getRoom();

  if (leftRoom && rightRoom) {
    const leftCenter = {
      x: leftRoom.x + Math.floor(leftRoom.width / 2),
      y: leftRoom.y + Math.floor(leftRoom.height / 2)
    };
    const rightCenter = {
      x: rightRoom.x + Math.floor(rightRoom.width / 2),
      y: rightRoom.y + Math.floor(rightRoom.height / 2)
    };

    drawCorridor(grid, leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y, rng);
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
const addDoors = (grid, rng, doorChance = 0.3) => {
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      if (grid[y][x] === TILES.CORRIDOR) {
        const neighbors = [
          grid[y - 1][x],
          grid[y + 1][x],
          grid[y][x - 1],
          grid[y][x + 1]
        ];

        const hasFloor = neighbors.includes(TILES.FLOOR);
        const hasWall = neighbors.includes(TILES.WALL);

        if (hasFloor && hasWall && rng.chance(doorChance)) {
          grid[y][x] = TILES.DOOR;
        }
      }
    }
  }
};

/**
 * Main BSP dungeon generator
 *
 * @param {number} tiles - Grid size
 * @param {object} options - Generation options
 * @param {number} [options.seed] - Random seed
 * @param {number} [options.minPartitionSize=6] - Minimum partition size
 * @param {number} [options.maxDepth=4] - Maximum BSP tree depth
 * @param {number} [options.minRoomSize=3] - Minimum room size
 * @param {number} [options.padding=1] - Padding between room and partition edge
 * @param {boolean} [options.addDoorsEnabled=true] - Whether to add doors
 * @param {number} [options.doorChance=0.3] - Probability of door placement
 * @param {boolean} [options.ensureConnected=true] - Validate and fix connectivity
 * @param {boolean} [options.placeMarkers=false] - Place start/end markers
 * @returns {{grid: number[][], seed: number, stats: object}}
 */
const generateBSP = (tiles, options = {}) => {
  const {
    seed,
    minPartitionSize = 6,
    maxDepth = 4,
    minRoomSize = 3,
    padding = 1,
    addDoorsEnabled = true,
    doorChance = 0.3,
    ensureConnected = true,
    placeMarkers = false
  } = options;

  const rng = createRandomUtils(seed);
  const width = tiles;
  const height = tiles;
  const grid = createSolidGrid(width, height);

  // Create root node
  const root = new BSPNode(1, 1, width - 2, height - 2);

  // Build BSP tree
  buildTree(root, minPartitionSize, maxDepth, rng);

  // Create rooms in leaf nodes
  createRooms(root, minRoomSize, padding, rng);

  // Draw rooms
  drawAllRooms(grid, root);

  // Connect rooms with corridors
  connectRoomsInTree(grid, root, rng);

  // Check connectivity and fix if needed
  let connectivity = checkConnectivity(grid);
  if (ensureConnected && !connectivity.connected) {
    connectRegions(grid);
    connectivity = checkConnectivity(grid);
  }

  // Add doors
  if (addDoorsEnabled) {
    addDoors(grid, rng, doorChance);
  }

  // Place markers
  let markers = { start: null, end: null };
  if (placeMarkers) {
    markers = placeStartEnd(grid, rng);
  }

  // Get room count
  const rooms = root.getAllRooms();

  return {
    grid,
    seed: rng.seed,
    stats: {
      roomCount: rooms.length,
      connected: connectivity.connected,
      regions: connectivity.regions,
      markers
    }
  };
};

// Default export for backward compatibility
export default (tiles, options = {}) => {
  const result = generateBSP(tiles, options);
  return result.grid;
};

export { generateBSP };
