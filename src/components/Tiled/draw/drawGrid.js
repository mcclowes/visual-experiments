import { getPalette } from "./tileColors";

/**
 * Terrain grid drawing for Perlin generators
 * (Dungeon-style generators use tile.js for unified rendering)
 */

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
 * Main grid drawing function (terrain only)
 */
const drawGrid = (context, grid, width, height) => {
  const tileWidth = width / grid[0].length;
  const tileHeight = height / grid.length;
  const palette = getPalette();

  // Clear canvas with deep water color
  context.fillStyle = palette[0];
  context.fillRect(0, 0, width, height);

  // Draw each terrain tile
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      drawTerrainTile(context, x, y, tileWidth, tileHeight, grid, palette);
    }
  }
};

export default drawGrid;
