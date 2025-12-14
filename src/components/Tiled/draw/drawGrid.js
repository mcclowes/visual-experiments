import { getTileColor, getPalette } from "./tileColors";

/**
 * Enhanced grid drawing with support for multiple generator types
 */

/**
 * Draw a simple filled tile
 */
const drawSimpleTile = (context, x, y, width, height, color) => {
  context.fillStyle = color;
  context.fillRect(x * width, y * height, width, height);
};

/**
 * Draw a tile with rounded corners for dungeon-style maps
 */
const drawDungeonTile = (context, x, y, width, height, grid, palette) => {
  const xCo = x * width;
  const yCo = y * height;
  const tileType = grid[y][x];

  // Skip empty/wall tiles for dungeon style
  if (tileType === 0) {
    context.fillStyle = palette[0];
    context.fillRect(xCo, yCo, width, height);
    return;
  }

  // Background shadow
  context.fillStyle = "#888888";
  context.fillRect(xCo + 2, yCo + 2, width, height);

  // Main tile
  context.fillStyle = palette[tileType] || palette[1];
  context.fillRect(xCo, yCo, width, height);

  // Grid lines
  context.strokeStyle = "rgba(0, 0, 0, 0.1)";
  context.strokeRect(xCo, yCo, width, height);

  // Door indicator
  if (tileType === 2) {
    context.fillStyle = "#5d3a1a";
    context.fillRect(xCo + width * 0.3, yCo + height * 0.4, width * 0.4, height * 0.2);
  }

  // Corridor indicator (subtle)
  if (tileType === 4) {
    context.strokeStyle = "rgba(0, 0, 0, 0.15)";
    context.setLineDash([2, 2]);
    context.strokeRect(xCo + 2, yCo + 2, width - 4, height - 4);
    context.setLineDash([]);
  }
};

/**
 * Draw terrain-style tile with gradients
 */
const drawTerrainTile = (context, x, y, width, height, grid, palette) => {
  const xCo = x * width;
  const yCo = y * height;
  const tileType = grid[y][x];

  // Base color
  context.fillStyle = palette[tileType] || "#ff00ff";
  context.fillRect(xCo, yCo, width, height);

  // Add texture/variation
  const variation = (Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.1);
  context.fillStyle = `rgba(${variation > 0 ? 255 : 0}, ${variation > 0 ? 255 : 0}, ${variation > 0 ? 255 : 0}, ${Math.abs(variation)})`;
  context.fillRect(xCo, yCo, width, height);

  // Water waves effect
  if (tileType === 0 || tileType === 1) {
    context.strokeStyle = "rgba(255, 255, 255, 0.2)";
    context.beginPath();
    const waveOffset = (x + y) % 3;
    context.moveTo(xCo, yCo + height * 0.3 + waveOffset);
    context.quadraticCurveTo(
      xCo + width * 0.5, yCo + height * 0.5 + waveOffset,
      xCo + width, yCo + height * 0.3 + waveOffset
    );
    context.stroke();
  }

  // Mountain peaks
  if (tileType === 5) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.7, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.3, yCo + height * 0.5);
    context.closePath();
    context.fill();
  }

  // Tree dots for forest
  if (tileType === 4) {
    context.fillStyle = "#1b5e20";
    const treeX = xCo + width * 0.3 + (x % 2) * width * 0.2;
    const treeY = yCo + height * 0.3 + (y % 2) * height * 0.2;
    context.beginPath();
    context.arc(treeX, treeY, width * 0.15, 0, Math.PI * 2);
    context.fill();
  }
};

/**
 * Draw maze-style tile (unified with dungeon style)
 */
const drawMazeTile = (context, x, y, width, height, grid, palette) => {
  const xCo = x * width;
  const yCo = y * height;
  const tileType = grid[y][x];

  // Wall tiles - same as dungeon style
  if (tileType === 0) {
    context.fillStyle = palette[0];
    context.fillRect(xCo, yCo, width, height);
    return;
  }

  // Background shadow for non-wall tiles (matches dungeon style)
  context.fillStyle = "#888888";
  context.fillRect(xCo + 2, yCo + 2, width, height);

  // Main tile
  context.fillStyle = palette[tileType] || palette[1];
  context.fillRect(xCo, yCo, width, height);

  // Grid lines (matches dungeon style)
  context.strokeStyle = "rgba(0, 0, 0, 0.1)";
  context.strokeRect(xCo, yCo, width, height);

  // Start marker (white arrow)
  if (tileType === 2) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.3, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.7, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.3, yCo + height * 0.8);
    context.closePath();
    context.fill();
  }

  // End marker (white circle)
  if (tileType === 3) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(xCo + width * 0.5, yCo + height * 0.5, width * 0.25, 0, Math.PI * 2);
    context.fill();
  }
};

/**
 * Main grid drawing function
 */
const drawGrid = (context, grid, width, height, generatorType) => {
  const tileWidth = width / grid[0].length;
  const tileHeight = height / grid.length;
  const palette = getPalette(generatorType);

  // Clear canvas
  context.fillStyle = palette[0] || "#333333";
  context.fillRect(0, 0, width, height);

  // Draw each tile
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      switch (generatorType) {
        case "perlin":
          drawTerrainTile(context, x, y, tileWidth, tileHeight, grid, palette);
          break;
        case "maze":
        case "maze-prims":
        case "maze-division":
          drawMazeTile(context, x, y, tileWidth, tileHeight, grid, palette);
          break;
        case "wfc":
        case "bsp":
        case "caves":
        case "drunkard":
        default:
          drawDungeonTile(context, x, y, tileWidth, tileHeight, grid, palette);
          break;
      }
    }
  }
};

export default drawGrid;
