import { getPalette, TERRAIN_TYPES } from "./tileColors";

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

  // Water waves effect (deep water and water)
  if (tileType === TERRAIN_TYPES.DEEP_WATER || tileType === TERRAIN_TYPES.WATER) {
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

  // Sand texture (small dots)
  if (tileType === TERRAIN_TYPES.SAND) {
    context.fillStyle = "rgba(210, 180, 140, 0.3)";
    for (let i = 0; i < 3; i++) {
      const dotX = xCo + width * (0.2 + ((x * 3 + i) % 5) * 0.15);
      const dotY = yCo + height * (0.2 + ((y * 2 + i) % 4) * 0.2);
      context.beginPath();
      context.arc(dotX, dotY, width * 0.03, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Grass blades
  if (tileType === TERRAIN_TYPES.GRASS) {
    context.strokeStyle = "rgba(100, 180, 80, 0.5)";
    context.lineWidth = 1;
    const bladeX = xCo + width * 0.5 + ((x % 3) - 1) * width * 0.15;
    context.beginPath();
    context.moveTo(bladeX, yCo + height * 0.8);
    context.lineTo(bladeX + 2, yCo + height * 0.4);
    context.stroke();
  }

  // Tree dots for forest
  if (tileType === TERRAIN_TYPES.FOREST) {
    context.fillStyle = "#1b5e20";
    const treeX = xCo + width * 0.3 + (x % 2) * width * 0.2;
    const treeY = yCo + height * 0.3 + (y % 2) * height * 0.2;
    context.beginPath();
    context.arc(treeX, treeY, width * 0.15, 0, Math.PI * 2);
    context.fill();
  }

  // Mountain peaks
  if (tileType === TERRAIN_TYPES.MOUNTAIN) {
    context.fillStyle = "#9e9e9e";
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.15);
    context.lineTo(xCo + width * 0.75, yCo + height * 0.55);
    context.lineTo(xCo + width * 0.25, yCo + height * 0.55);
    context.closePath();
    context.fill();
    // Snow cap
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.15);
    context.lineTo(xCo + width * 0.6, yCo + height * 0.35);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.35);
    context.closePath();
    context.fill();
  }

  // Snow sparkles
  if (tileType === TERRAIN_TYPES.SNOW) {
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    const sparkleX = xCo + width * (0.3 + (x % 3) * 0.2);
    const sparkleY = yCo + height * (0.3 + (y % 3) * 0.2);
    context.beginPath();
    context.arc(sparkleX, sparkleY, width * 0.04, 0, Math.PI * 2);
    context.fill();
    // Add subtle blue shadow
    context.fillStyle = "rgba(200, 220, 255, 0.3)";
    context.fillRect(xCo, yCo + height * 0.7, width, height * 0.3);
  }

  // Swamp murky water and reeds
  if (tileType === TERRAIN_TYPES.SWAMP) {
    // Murky water patches
    context.fillStyle = "rgba(60, 80, 60, 0.4)";
    context.beginPath();
    context.arc(xCo + width * 0.4, yCo + height * 0.5, width * 0.2, 0, Math.PI * 2);
    context.fill();
    // Reed lines
    context.strokeStyle = "rgba(80, 60, 40, 0.6)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(xCo + width * 0.7, yCo + height * 0.8);
    context.lineTo(xCo + width * 0.7, yCo + height * 0.3);
    context.stroke();
    context.beginPath();
    context.moveTo(xCo + width * 0.8, yCo + height * 0.85);
    context.lineTo(xCo + width * 0.78, yCo + height * 0.4);
    context.stroke();
  }

  // Volcanic lava cracks
  if (tileType === TERRAIN_TYPES.VOLCANIC) {
    // Glow effect
    context.fillStyle = "rgba(255, 100, 0, 0.3)";
    context.fillRect(xCo, yCo, width, height);
    // Lava cracks
    context.strokeStyle = "#ff5722";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(xCo + width * 0.1, yCo + height * 0.3);
    context.lineTo(xCo + width * 0.5, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.9, yCo + height * 0.7);
    context.stroke();
    // Hot spots
    context.fillStyle = "#ffcc00";
    context.beginPath();
    context.arc(xCo + width * 0.5, yCo + height * 0.5, width * 0.08, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 1;
  }

  // Plains gentle texture
  if (tileType === TERRAIN_TYPES.PLAINS) {
    // Soft grass patterns
    context.strokeStyle = "rgba(139, 195, 74, 0.4)";
    context.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      const grassX = xCo + width * (0.3 + i * 0.4);
      context.beginPath();
      context.moveTo(grassX, yCo + height * 0.7);
      context.quadraticCurveTo(grassX + 2, yCo + height * 0.5, grassX, yCo + height * 0.35);
      context.stroke();
    }
  }

  // Hills shading
  if (tileType === TERRAIN_TYPES.HILLS) {
    // Hill shape
    context.fillStyle = "rgba(140, 110, 90, 0.4)";
    context.beginPath();
    context.moveTo(xCo, yCo + height * 0.7);
    context.quadraticCurveTo(xCo + width * 0.5, yCo + height * 0.2, xCo + width, yCo + height * 0.7);
    context.lineTo(xCo + width, yCo + height);
    context.lineTo(xCo, yCo + height);
    context.closePath();
    context.fill();
    // Highlight
    context.fillStyle = "rgba(180, 150, 130, 0.3)";
    context.beginPath();
    context.moveTo(xCo + width * 0.3, yCo + height * 0.55);
    context.quadraticCurveTo(xCo + width * 0.5, yCo + height * 0.3, xCo + width * 0.7, yCo + height * 0.55);
    context.stroke();
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
