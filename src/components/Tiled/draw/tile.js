import roundRect from "./rectangle";

// Tile type constants for dungeon generators
export const TILE_TYPES = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  SECRET_DOOR: 3,
  START: 4,
  END: 5,
  WATER: 6,
  LAVA: 7,
  STAIRS_UP: 8,
  STAIRS_DOWN: 9,
  CHEST: 10,
  TRAP: 11,
  PILLAR: 12
};

// Color palette for dungeon tiles
const TILE_COLORS = {
  [TILE_TYPES.FLOOR]: "#fefef4",
  [TILE_TYPES.DOOR]: "#fefef4",
  [TILE_TYPES.SECRET_DOOR]: "#fefef4",
  [TILE_TYPES.START]: "#4a7c4e",
  [TILE_TYPES.END]: "#8b4513",
  [TILE_TYPES.WATER]: "#4a90d9",
  [TILE_TYPES.LAVA]: "#d84315",
  [TILE_TYPES.STAIRS_UP]: "#a0a0a0",
  [TILE_TYPES.STAIRS_DOWN]: "#707070",
  [TILE_TYPES.CHEST]: "#ffd54f",
  [TILE_TYPES.TRAP]: "#e57373",
  [TILE_TYPES.PILLAR]: "#9e9e9e"
};

const fill = squareType => {
  return TILE_COLORS[squareType] || `rgba(248, 248, 244, 1)`;
};

const findEdges = (grid, x, y) => {
  const edges = [false, false, false, false];

  if (y !== 0 && grid[y - 1][x] === 0) {
    edges[0] = true;
  }
  if (x !== grid[0].length - 1 && grid[y][x + 1] === 0) {
    edges[1] = true;
  }
  if (y !== grid.length - 1 && grid[y + 1][x] === 0) {
    edges[2] = true;
  }
  if (x !== 0 && grid[y][x - 1] === 0) {
    edges[3] = true;
  }

  return edges;
};

const findCorners = edges => {
  const corners = [false, false, false, false];
  if (edges[3] && edges[0]) {
    corners[0] = true;
  }
  if (edges[0] && edges[1]) {
    corners[1] = true;
  }
  if (edges[1] && edges[2]) {
    corners[2] = true;
  }
  if (edges[2] && edges[3]) {
    corners[3] = true;
  }
  return corners;
};

const drawTile = (context, width, height) => (x, y, grid) => {
  const xCo = x * width;
  const yCo = y * height;

  const squareType = grid[y][x];
  if (squareType === 0) {
    return;
  }

  // edges and corners
  const edges = findEdges(grid, x, y);
  const corners = findCorners(edges);

  const applyBgRadius = corner => (!!corner ? (width + 10) / 2 : 0);
  let bgRadius = [
    applyBgRadius(corners[0]),
    applyBgRadius(corners[1]),
    applyBgRadius(corners[2]),
    applyBgRadius(corners[3])
  ];

  // background shadow (depth effect)
  context.fillStyle = "#8a8a8a";

  let bgX = xCo;
  let bgY = yCo;
  let bgWidth = width;
  let bgHeight = height;

  if (edges[3]) {
    bgX = bgX - 6;
    bgWidth = bgWidth + 6;
  }
  if (edges[0]) {
    bgY = bgY - 6;
    bgHeight = bgHeight + 6;
  }

  if (edges[1]) {
    bgWidth = bgWidth + 6;
  }
  if (edges[2]) {
    bgHeight = bgHeight + 6;
  }

  roundRect(context, bgX, bgY, bgWidth, bgHeight, bgRadius, true, false);

  // Mid-tone border layer
  context.fillStyle = "#b0b0b0";
  roundRect(context, bgX + 1, bgY + 1, bgWidth - 2, bgHeight - 2, bgRadius, true, false);

  // fill
  context.fillStyle = fill(squareType);
  const applyRadius = corner => (!!corner ? width / 2 : 0);
  let radius = [
    applyRadius(corners[0]),
    applyRadius(corners[1]),
    applyRadius(corners[2]),
    applyRadius(corners[3])
  ];
  roundRect(context, xCo, yCo, width, height, radius, true, false);

  // Add subtle inner highlight for floor tiles
  if (squareType === TILE_TYPES.FLOOR) {
    context.fillStyle = "rgba(255, 255, 255, 0.15)";
    roundRect(context, xCo + 1, yCo + 1, width - 2, height * 0.4, radius, true, false);
  }

  // drawLines ignoring corners
  context.setLineDash([5, 3]); /*dashes are 5px and spaces are 3px*/
  context.beginPath();
  context.moveTo(xCo, yCo);

  if (edges[0]) {
    context.moveTo(xCo + width, yCo);
  } else {
    context.lineTo(xCo + width, yCo);
  }

  if (edges[1]) {
    context.moveTo(xCo + width, yCo + height);
  } else {
    context.lineTo(xCo + width, yCo + height);
  }

  // cover top and right only
  //   if(edges[2]) {
  //     context.moveTo(xCo, yCo + height);
  //   } else {
  //     context.lineTo(xCo, yCo + height);
  //   }
  //
  //   if(edges[3]) {
  //     context.moveTo(xCo, yCo);
  //   } else {
  //     context.lineTo(xCo, yCo);
  //   }

  context.strokeStyle = `rgba(100, 100, 100, 0.75)`;
  context.stroke();

  // door
  if (squareType === 2) {
    context.fillStyle = "#aaaaaa";

    let secret = [0, 0, 0, 0];
    if (edges[0]) {
      secret[0] = true;
    }
    if (edges[1]) {
      secret[1] = true;
    }
    if (edges[2]) {
      secret[2] = true;
    }
    if (edges[3]) {
      secret[3] = true;
    }

    if (secret[0] && secret[2]) {
      context.fillRect(xCo + width / 2 - 2, yCo, 4, height);
    } else {
      context.fillRect(xCo, yCo + height / 2 - 2, width, 4);
    }
  }

  // secret door
  if (squareType === 3) {
    context.fillStyle = "#aaaaaa";

    let secret = [0, 0, 0, 0];
    if (edges[0]) {
      secret[0] = true;
    }
    if (edges[1]) {
      secret[1] = true;
    }
    if (edges[2]) {
      secret[2] = true;
    }
    if (edges[3]) {
      secret[3] = true;
    }

    if (secret[0] && secret[2]) {
      context.fillRect(xCo + width / 6, yCo, (width / 3) * 2, height);
    } else {
      context.fillRect(xCo, yCo + height / 6, width, (height / 3) * 2);
    }
  }

  // start marker (arrow)
  if (squareType === 4) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.3, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.7, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.3, yCo + height * 0.8);
    context.closePath();
    context.fill();
  }

  // end marker (circle)
  if (squareType === 5) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(xCo + width * 0.5, yCo + height * 0.5, width * 0.25, 0, Math.PI * 2);
    context.fill();
  }

  // water tile (wave pattern)
  if (squareType === TILE_TYPES.WATER) {
    // Add wave lines
    context.strokeStyle = "rgba(255, 255, 255, 0.4)";
    context.lineWidth = 1.5;
    context.beginPath();
    const waveOffset = (x + y) % 3;
    context.moveTo(xCo + 2, yCo + height * 0.35 + waveOffset);
    context.quadraticCurveTo(
      xCo + width * 0.5, yCo + height * 0.25 + waveOffset,
      xCo + width - 2, yCo + height * 0.35 + waveOffset
    );
    context.stroke();
    context.beginPath();
    context.moveTo(xCo + 2, yCo + height * 0.65 + waveOffset);
    context.quadraticCurveTo(
      xCo + width * 0.5, yCo + height * 0.55 + waveOffset,
      xCo + width - 2, yCo + height * 0.65 + waveOffset
    );
    context.stroke();
    context.lineWidth = 1;
  }

  // lava tile (glow and bubbles)
  if (squareType === TILE_TYPES.LAVA) {
    // Add glow effect
    context.fillStyle = "rgba(255, 200, 100, 0.3)";
    context.fillRect(xCo + 2, yCo + 2, width - 4, height - 4);
    // Add bubble spots
    context.fillStyle = "rgba(255, 150, 50, 0.8)";
    context.beginPath();
    context.arc(xCo + width * 0.3, yCo + height * 0.4, width * 0.08, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(xCo + width * 0.7, yCo + height * 0.6, width * 0.1, 0, Math.PI * 2);
    context.fill();
    // Bright cracks
    context.strokeStyle = "#ffcc00";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(xCo + width * 0.2, yCo + height * 0.7);
    context.lineTo(xCo + width * 0.5, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.8, yCo + height * 0.3);
    context.stroke();
    context.lineWidth = 1;
  }

  // stairs up (upward arrow)
  if (squareType === TILE_TYPES.STAIRS_UP) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.75, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.6, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.6, yCo + height * 0.8);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.8);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.25, yCo + height * 0.5);
    context.closePath();
    context.fill();
  }

  // stairs down (downward arrow)
  if (squareType === TILE_TYPES.STAIRS_DOWN) {
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.8);
    context.lineTo(xCo + width * 0.75, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.6, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.6, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.5);
    context.lineTo(xCo + width * 0.25, yCo + height * 0.5);
    context.closePath();
    context.fill();
  }

  // chest/treasure (treasure box icon)
  if (squareType === TILE_TYPES.CHEST) {
    // Box body
    context.fillStyle = "#b8860b";
    context.fillRect(xCo + width * 0.2, yCo + height * 0.4, width * 0.6, height * 0.45);
    // Box lid
    context.fillStyle = "#daa520";
    context.fillRect(xCo + width * 0.18, yCo + height * 0.3, width * 0.64, height * 0.15);
    // Lock
    context.fillStyle = "#ffffff";
    context.fillRect(xCo + width * 0.45, yCo + height * 0.5, width * 0.1, height * 0.15);
  }

  // trap (warning symbol)
  if (squareType === TILE_TYPES.TRAP) {
    // Triangle warning
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(xCo + width * 0.5, yCo + height * 0.2);
    context.lineTo(xCo + width * 0.8, yCo + height * 0.75);
    context.lineTo(xCo + width * 0.2, yCo + height * 0.75);
    context.closePath();
    context.stroke();
    // Exclamation mark
    context.fillStyle = "#ffffff";
    context.fillRect(xCo + width * 0.46, yCo + height * 0.35, width * 0.08, height * 0.22);
    context.beginPath();
    context.arc(xCo + width * 0.5, yCo + height * 0.65, width * 0.05, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 1;
  }

  // pillar (column icon)
  if (squareType === TILE_TYPES.PILLAR) {
    // Main column
    context.fillStyle = "#e0e0e0";
    context.fillRect(xCo + width * 0.3, yCo + height * 0.2, width * 0.4, height * 0.6);
    // Top cap
    context.fillStyle = "#bdbdbd";
    context.fillRect(xCo + width * 0.25, yCo + height * 0.15, width * 0.5, height * 0.1);
    // Bottom base
    context.fillRect(xCo + width * 0.25, yCo + height * 0.75, width * 0.5, height * 0.1);
    // Shading line
    context.strokeStyle = "#9e9e9e";
    context.beginPath();
    context.moveTo(xCo + width * 0.4, yCo + height * 0.25);
    context.lineTo(xCo + width * 0.4, yCo + height * 0.75);
    context.stroke();
  }
};

export default drawTile;
