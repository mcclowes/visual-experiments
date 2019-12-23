import roundRect from "./rectangle";

const fill = squareType => {
  if (squareType === 1 || squareType === 2) {
    return `#fefef4`;
  }

  //return `rgba(204, 204, 0, 0.8)`; //yellow
  return `rgba(248, 248, 244, 1)`; //grey
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

  // background
  context.fillStyle = "#aaaaaa";

  let bgX = xCo;
  let bgY = yCo;
  let bgWidth = width;
  let bgHeight = height;

  if (edges[3]) {
    bgX = bgX - 5;
    bgWidth = bgWidth + 5;
  }
  if (edges[0]) {
    bgY = bgY - 5;
    bgHeight = bgHeight + 5;
  }

  if (edges[1]) {
    bgWidth = bgWidth + 5;
  }
  if (edges[2]) {
    bgHeight = bgHeight + 5;
  }

  roundRect(context, bgX, bgY, bgWidth, bgHeight, bgRadius, true, false);

  // lines
  // context.fillStyle = `rgba(0, 51, 0, 0.8)`; dark green
  // context.fillRect(xCo, yCo, width, height);

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
};

export default drawTile;
