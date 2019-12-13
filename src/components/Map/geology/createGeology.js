import { randomItem, randomNumber } from "../utils/random";
import { gaussianBlur } from "../utils/imaging";

const clump = geology => {
  const arr = geology;

  for (let i = 0; i < geology.length - 1; i++) {
    for (let j = 0; j < geology[i].length - 1; j++) {
      if (
        i === 0 ||
        j === 0 ||
        i === geology.length - 1 ||
        j === geology[i].length - 1
      ) {
      } else {
        const neighbours = [
          geology[i - 1][j - 1],
          geology[i - 1][j],
          geology[i - 1][j + 1],
          geology[i][j - 1],
          geology[i][j],
          geology[i][j + 1],
          geology[i + 1][j - 1],
          geology[i + 1][j],
          geology[i + 1][j + 1]
        ];

        const rockTypeCounts = [
          {
            type: 1,
            count: neighbours.reduce(
              (acc, x) => (acc = x === 1 ? acc + 1 : acc),
              0
            )
          },
          {
            type: 2,
            count: neighbours.reduce(
              (acc, x) => (acc = x === 2 ? acc + 1 : acc),
              0
            )
          },
          {
            type: 3,
            count: neighbours.reduce(
              (acc, x) => (acc = x === 3 ? acc + 1 : acc),
              0
            )
          }
        ];

        rockTypeCounts.sort((a, b) => (a.count <= b.count ? 1 : -1));

        arr[i][j] = rockTypeCounts[0].type;
      }
    }
  }

  return arr;
};

const seed = (height, width) => {
  return Array(width)
    .fill(0)
    .map(_ =>
      Array(height)
        .fill(0)
        .map(_ => randomNumber(3))
    );
};

const createGeology = (height, width) => {
  const geology = seed(height, width);

  const clumpedGeology = clump(geology);

  return clumpedGeology;
};

export default createGeology;
