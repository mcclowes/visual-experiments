/**
 * Classic D&D Dungeon Map Tile Renderer
 *
 * Renders tiles in the style of classic hand-drawn dungeon maps with:
 * - Crosshatched wall areas
 * - Clean white/cream floor tiles with subtle grid
 * - Solid black borders where floors meet walls
 * - Classic door symbols
 */

const COLORS = {
  floor: "#fefef8",      // Slightly off-white/cream for floor
  floorGrid: "#e0e0e0",  // Subtle grid lines on floor
  wall: "#ffffff",       // White background for crosshatch
  crosshatch: "#444444", // Dark gray for crosshatch lines
  border: "#000000",     // Black for room borders
  door: "#fefef8",       // Door background (same as floor)
  doorFrame: "#000000"   // Door frame color
};

/**
 * Check if a tile is a floor-type tile (walkable)
 */
const isFloorType = (tileType) => {
  return tileType === 1 || tileType === 2 || tileType === 3 || tileType === 4 || tileType === 5;
};

/**
 * Find which edges of a tile border walls (tile type 0)
 * Returns [top, right, bottom, left]
 */
const findWallEdges = (grid, x, y) => {
  const edges = [false, false, false, false];

  // Top edge
  if (y === 0 || grid[y - 1][x] === 0) {
    edges[0] = true;
  }
  // Right edge
  if (x === grid[0].length - 1 || grid[y][x + 1] === 0) {
    edges[1] = true;
  }
  // Bottom edge
  if (y === grid.length - 1 || grid[y + 1][x] === 0) {
    edges[2] = true;
  }
  // Left edge
  if (x === 0 || grid[y][x - 1] === 0) {
    edges[3] = true;
  }

  return edges;
};

/**
 * Check for diagonal corners that need wall borders
 * Returns [topLeft, topRight, bottomRight, bottomLeft]
 */
const findDiagonalWalls = (grid, x, y) => {
  const corners = [false, false, false, false];

  // Top-left diagonal
  if (x > 0 && y > 0 && grid[y - 1][x - 1] === 0) {
    corners[0] = true;
  }
  // Top-right diagonal
  if (x < grid[0].length - 1 && y > 0 && grid[y - 1][x + 1] === 0) {
    corners[1] = true;
  }
  // Bottom-right diagonal
  if (x < grid[0].length - 1 && y < grid.length - 1 && grid[y + 1][x + 1] === 0) {
    corners[2] = true;
  }
  // Bottom-left diagonal
  if (x > 0 && y < grid.length - 1 && grid[y + 1][x - 1] === 0) {
    corners[3] = true;
  }

  return corners;
};

/**
 * Draw crosshatch pattern for wall tiles
 */
const drawCrosshatch = (context, x, y, width, height, density = 4) => {
  context.save();

  // Create clipping region
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();

  context.strokeStyle = COLORS.crosshatch;
  context.lineWidth = 1;

  const spacing = width / density;
  const diagonal = Math.sqrt(width * width + height * height);

  // Draw diagonal lines (top-left to bottom-right)
  context.beginPath();
  for (let i = -diagonal; i < diagonal * 2; i += spacing) {
    context.moveTo(x + i, y);
    context.lineTo(x + i + height, y + height);
  }
  context.stroke();

  // Draw diagonal lines (top-right to bottom-left)
  context.beginPath();
  for (let i = -diagonal; i < diagonal * 2; i += spacing) {
    context.moveTo(x + width + i, y);
    context.lineTo(x + width + i - height, y + height);
  }
  context.stroke();

  context.restore();
};

/**
 * Draw floor tile with subtle grid
 */
const drawFloorTile = (context, x, y, width, height) => {
  // Fill with floor color
  context.fillStyle = COLORS.floor;
  context.fillRect(x, y, width, height);

  // Draw subtle grid lines
  context.strokeStyle = COLORS.floorGrid;
  context.lineWidth = 0.5;
  context.setLineDash([]);

  context.beginPath();
  // Right edge grid line
  context.moveTo(x + width, y);
  context.lineTo(x + width, y + height);
  // Bottom edge grid line
  context.moveTo(x, y + height);
  context.lineTo(x + width, y + height);
  context.stroke();
};

/**
 * Draw wall borders on edges that touch walls
 */
const drawWallBorders = (context, x, y, width, height, wallEdges, diagonalWalls) => {
  context.strokeStyle = COLORS.border;
  context.lineWidth = 2;
  context.setLineDash([]);

  context.beginPath();

  // Top border
  if (wallEdges[0]) {
    context.moveTo(x, y);
    context.lineTo(x + width, y);
  }

  // Right border
  if (wallEdges[1]) {
    context.moveTo(x + width, y);
    context.lineTo(x + width, y + height);
  }

  // Bottom border
  if (wallEdges[2]) {
    context.moveTo(x + width, y + height);
    context.lineTo(x, y + height);
  }

  // Left border
  if (wallEdges[3]) {
    context.moveTo(x, y + height);
    context.lineTo(x, y);
  }

  context.stroke();
};

/**
 * Draw a door symbol
 */
const drawDoor = (context, x, y, width, height, wallEdges) => {
  // First draw as floor
  drawFloorTile(context, x, y, width, height);

  // Determine door orientation based on which edges have walls
  const isVertical = wallEdges[0] && wallEdges[2]; // walls top and bottom = vertical door
  const isHorizontal = wallEdges[1] && wallEdges[3]; // walls left and right = horizontal door

  context.strokeStyle = COLORS.doorFrame;
  context.fillStyle = COLORS.floor;
  context.lineWidth = 2;
  context.setLineDash([]);

  if (isVertical) {
    // Door on left/right walls - draw horizontal door symbol
    const doorWidth = width * 0.8;
    const doorHeight = height * 0.15;
    const doorX = x + (width - doorWidth) / 2;
    const doorY = y + (height - doorHeight) / 2;

    // Door rectangle
    context.fillRect(doorX, doorY, doorWidth, doorHeight);
    context.strokeRect(doorX, doorY, doorWidth, doorHeight);

    // Draw wall continuation on top and bottom
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width, y);
    context.moveTo(x, y + height);
    context.lineTo(x + width, y + height);
    context.stroke();
  } else if (isHorizontal) {
    // Door on top/bottom walls - draw vertical door symbol
    const doorWidth = width * 0.15;
    const doorHeight = height * 0.8;
    const doorX = x + (width - doorWidth) / 2;
    const doorY = y + (height - doorHeight) / 2;

    // Door rectangle
    context.fillRect(doorX, doorY, doorWidth, doorHeight);
    context.strokeRect(doorX, doorY, doorWidth, doorHeight);

    // Draw wall continuation on left and right
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y + height);
    context.moveTo(x + width, y);
    context.lineTo(x + width, y + height);
    context.stroke();
  } else {
    // Default: draw a simple door marker
    context.beginPath();
    context.arc(x + width / 2, y + height / 2, width * 0.2, 0, Math.PI * 2);
    context.stroke();
  }
};

/**
 * Draw a secret door symbol (S marking)
 */
const drawSecretDoor = (context, x, y, width, height, wallEdges) => {
  // Draw as regular door first
  drawDoor(context, x, y, width, height, wallEdges);

  // Add 'S' marker
  context.fillStyle = COLORS.border;
  context.font = `bold ${Math.floor(width * 0.4)}px serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("S", x + width / 2, y + height / 2);
};

/**
 * Draw start marker
 */
const drawStartMarker = (context, x, y, width, height, wallEdges) => {
  // Draw floor first
  drawFloorTile(context, x, y, width, height);
  drawWallBorders(context, x, y, width, height, wallEdges, []);

  // Draw arrow pointing right (entrance)
  context.fillStyle = "#2d5a27";
  context.beginPath();
  context.moveTo(x + width * 0.25, y + height * 0.25);
  context.lineTo(x + width * 0.75, y + height * 0.5);
  context.lineTo(x + width * 0.25, y + height * 0.75);
  context.closePath();
  context.fill();
};

/**
 * Draw end marker
 */
const drawEndMarker = (context, x, y, width, height, wallEdges) => {
  // Draw floor first
  drawFloorTile(context, x, y, width, height);
  drawWallBorders(context, x, y, width, height, wallEdges, []);

  // Draw X or target symbol
  context.strokeStyle = "#8b2500";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x + width * 0.25, y + height * 0.25);
  context.lineTo(x + width * 0.75, y + height * 0.75);
  context.moveTo(x + width * 0.75, y + height * 0.25);
  context.lineTo(x + width * 0.25, y + height * 0.75);
  context.stroke();
};

/**
 * Main tile drawing function
 */
const drawTile = (context, width, height) => (x, y, grid) => {
  const xCo = x * width;
  const yCo = y * height;
  const squareType = grid[y][x];

  // Wall tiles - draw crosshatch
  if (squareType === 0) {
    drawCrosshatch(context, xCo, yCo, width, height, 4);
    return;
  }

  const wallEdges = findWallEdges(grid, x, y);
  const diagonalWalls = findDiagonalWalls(grid, x, y);

  // Floor tile
  if (squareType === 1) {
    drawFloorTile(context, xCo, yCo, width, height);
    drawWallBorders(context, xCo, yCo, width, height, wallEdges, diagonalWalls);
    return;
  }

  // Door
  if (squareType === 2) {
    drawDoor(context, xCo, yCo, width, height, wallEdges);
    return;
  }

  // Secret door
  if (squareType === 3) {
    drawSecretDoor(context, xCo, yCo, width, height, wallEdges);
    return;
  }

  // Start marker
  if (squareType === 4) {
    drawStartMarker(context, xCo, yCo, width, height, wallEdges);
    return;
  }

  // End marker
  if (squareType === 5) {
    drawEndMarker(context, xCo, yCo, width, height, wallEdges);
    return;
  }

  // Default: treat as floor
  drawFloorTile(context, xCo, yCo, width, height);
  drawWallBorders(context, xCo, yCo, width, height, wallEdges, diagonalWalls);
};

export default drawTile;
