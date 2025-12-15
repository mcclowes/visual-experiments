/**
 * Connectivity validation utilities for map generation
 *
 * Provides flood-fill and connectivity checking to ensure generated maps
 * have fully connected walkable areas.
 */

import { TILES, isFloorLike } from '../constants/tiles';

/**
 * Flood fill from a starting point, returning all connected cells
 * @param {number[][]} grid - The tile grid
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {function} isValid - Function to check if a tile is valid for filling
 * @returns {Set<string>} Set of "x,y" coordinate strings for connected cells
 */
export const floodFill = (grid, startX, startY, isValid) => {
  const height = grid.length;
  const width = grid[0].length;
  const visited = new Set();
  const stack = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (!isValid(grid[y][x], x, y)) continue;

    visited.add(key);

    // Add 4-directional neighbors
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  return visited;
};

/**
 * Find all walkable cells in a grid
 * @param {number[][]} grid - The tile grid
 * @param {function} [isWalkableFn] - Custom walkability check (defaults to isFloorLike)
 * @returns {Array<{x: number, y: number}>} Array of walkable cell coordinates
 */
export const findWalkableCells = (grid, isWalkableFn = isFloorLike) => {
  const cells = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (isWalkableFn(grid[y][x])) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
};

/**
 * Find all connected regions in a grid
 * @param {number[][]} grid - The tile grid
 * @param {function} [isWalkableFn] - Custom walkability check
 * @returns {Array<Set<string>>} Array of sets, each containing "x,y" coords for a region
 */
export const findRegions = (grid, isWalkableFn = isFloorLike) => {
  const allVisited = new Set();
  const regions = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const key = `${x},${y}`;
      if (allVisited.has(key)) continue;
      if (!isWalkableFn(grid[y][x])) continue;

      const region = floodFill(grid, x, y, (tile) => isWalkableFn(tile));
      if (region.size > 0) {
        regions.push(region);
        region.forEach(k => allVisited.add(k));
      }
    }
  }

  return regions;
};

/**
 * Check if a grid is fully connected (all walkable cells reachable from any other)
 * @param {number[][]} grid - The tile grid
 * @param {function} [isWalkableFn] - Custom walkability check
 * @returns {{connected: boolean, regions: number, largestRegion: number, totalWalkable: number}}
 */
export const checkConnectivity = (grid, isWalkableFn = isFloorLike) => {
  const regions = findRegions(grid, isWalkableFn);
  const totalWalkable = regions.reduce((sum, r) => sum + r.size, 0);
  const largestRegion = regions.length > 0 ? Math.max(...regions.map(r => r.size)) : 0;

  return {
    connected: regions.length <= 1,
    regions: regions.length,
    largestRegion,
    totalWalkable
  };
};

/**
 * Get the largest connected region
 * @param {number[][]} grid - The tile grid
 * @param {function} [isWalkableFn] - Custom walkability check
 * @returns {Set<string>} Set of "x,y" coordinates in the largest region
 */
export const getLargestRegion = (grid, isWalkableFn = isFloorLike) => {
  const regions = findRegions(grid, isWalkableFn);
  if (regions.length === 0) return new Set();

  return regions.reduce((largest, region) =>
    region.size > largest.size ? region : largest
  );
};

/**
 * Remove disconnected regions, keeping only the largest
 * @param {number[][]} grid - The tile grid (will be modified in place)
 * @param {function} [isWalkableFn] - Custom walkability check
 * @param {number} [fillTile] - Tile type to fill removed areas with (default: WALL)
 * @returns {number[][]} The modified grid
 */
export const keepLargestRegion = (grid, isWalkableFn = isFloorLike, fillTile = TILES.WALL) => {
  const largestRegion = getLargestRegion(grid, isWalkableFn);

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (isWalkableFn(grid[y][x]) && !largestRegion.has(`${x},${y}`)) {
        grid[y][x] = fillTile;
      }
    }
  }

  return grid;
};

/**
 * Connect disconnected regions by carving corridors between them
 * @param {number[][]} grid - The tile grid (will be modified in place)
 * @param {function} [isWalkableFn] - Custom walkability check
 * @param {number} [corridorTile] - Tile type for corridors (default: FLOOR)
 * @returns {number[][]} The modified grid
 */
export const connectRegions = (grid, isWalkableFn = isFloorLike, corridorTile = TILES.FLOOR) => {
  let regions = findRegions(grid, isWalkableFn);

  while (regions.length > 1) {
    // Find closest pair of regions
    let minDist = Infinity;
    let bestPair = null;

    for (let i = 0; i < regions.length - 1; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const { dist, point1, point2 } = findClosestPoints(regions[i], regions[j]);
        if (dist < minDist) {
          minDist = dist;
          bestPair = { region1: i, region2: j, point1, point2 };
        }
      }
    }

    if (!bestPair) break;

    // Carve corridor between closest points
    carveCorridor(grid, bestPair.point1, bestPair.point2, corridorTile);

    // Recalculate regions
    regions = findRegions(grid, isWalkableFn);
  }

  return grid;
};

/**
 * Find closest points between two regions
 * @param {Set<string>} region1 - First region
 * @param {Set<string>} region2 - Second region
 * @returns {{dist: number, point1: {x: number, y: number}, point2: {x: number, y: number}}}
 */
const findClosestPoints = (region1, region2) => {
  let minDist = Infinity;
  let point1 = null;
  let point2 = null;

  for (const key1 of region1) {
    const [x1, y1] = key1.split(',').map(Number);
    for (const key2 of region2) {
      const [x2, y2] = key2.split(',').map(Number);
      const dist = Math.abs(x2 - x1) + Math.abs(y2 - y1); // Manhattan distance
      if (dist < minDist) {
        minDist = dist;
        point1 = { x: x1, y: y1 };
        point2 = { x: x2, y: y2 };
      }
    }
  }

  return { dist: minDist, point1, point2 };
};

/**
 * Carve a corridor between two points (L-shaped)
 * @param {number[][]} grid - The tile grid
 * @param {{x: number, y: number}} point1 - Start point
 * @param {{x: number, y: number}} point2 - End point
 * @param {number} corridorTile - Tile type for corridor
 */
const carveCorridor = (grid, point1, point2, corridorTile) => {
  let x = point1.x;
  let y = point1.y;

  // Move horizontally first
  while (x !== point2.x) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = corridorTile;
      }
    }
    x += x < point2.x ? 1 : -1;
  }

  // Then move vertically
  while (y !== point2.y) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      if (grid[y][x] === TILES.WALL) {
        grid[y][x] = corridorTile;
      }
    }
    y += y < point2.y ? 1 : -1;
  }

  // Mark final point
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
    if (grid[y][x] === TILES.WALL) {
      grid[y][x] = corridorTile;
    }
  }
};

/**
 * Place start and end markers in a grid
 * @param {number[][]} grid - The tile grid (will be modified in place)
 * @param {object} rng - Random utility object with randomItem method
 * @param {function} [isWalkableFn] - Custom walkability check
 * @returns {{start: {x: number, y: number}|null, end: {x: number, y: number}|null}}
 */
export const placeStartEnd = (grid, rng, isWalkableFn = isFloorLike) => {
  const walkable = findWalkableCells(grid, isWalkableFn);
  if (walkable.length < 2) {
    return { start: null, end: null };
  }

  // Find start point (prefer corners/edges)
  const start = rng.randomItem(walkable);
  grid[start.y][start.x] = TILES.START;

  // Find end point far from start
  const remaining = walkable.filter(c => c.x !== start.x || c.y !== start.y);
  remaining.sort((a, b) => {
    const distA = Math.abs(a.x - start.x) + Math.abs(a.y - start.y);
    const distB = Math.abs(b.x - start.x) + Math.abs(b.y - start.y);
    return distB - distA;
  });

  // Pick from the farthest 20%
  const farCandidates = remaining.slice(0, Math.max(1, Math.floor(remaining.length * 0.2)));
  const end = rng.randomItem(farCandidates);
  grid[end.y][end.x] = TILES.END;

  return { start, end };
};
