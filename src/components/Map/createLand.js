import { randomItem, randomNumber } from "./utils/random";
import { gaussianBlur } from "./utils/imaging";

const selectParent = (parentTop, parentLeft, parentTopLeft) => {
  const rand = randomNumber(13);

  if (rand === 1 || rand === 7 || rand === 8 || rand === 9) {
    return parentTop;
  } else if (rand === 2 || rand === 10 || rand === 11 || rand === 12) {
    return parentLeft;
  } else if (rand === 3) {
    return parentTopLeft;
  } else if (rand === 4) {
    return (parentTop + parentLeft) / 2;
  } else if (rand === 5) {
    return (parentTop + parentTopLeft) / 2;
  } else if (rand === 6) {
    return (parentLeft + parentTopLeft) / 2;
  }

  return (parentTop + parentLeft + parentTopLeft) / 3;
};

const undulate = base => {
  const rand = randomNumber(7);

  if (rand === 1) {
    return base;
  } else if (rand === 2 || rand === 3 || rand === 4) {
    return base - randomNumber(2);
  } else {
    return base + randomNumber(2);
  }
};

const createLand = (height, width) => {
  const land = Array(width).fill(0);

  for (let i = 0; i < land.length - 1; i++) {
    const arr = Array(height).fill(125);

    for (let j = 0; j < arr.length - 1; j++) {
      if (j !== 0) {
        let base;

        if (i === 0 && j === 0) {
          base = arr[j];
        } else if (i === 0) {
          base = arr[j - 1];
        } else if (j === 0) {
          base = land[i - 1][j];
        } else {
          base = selectParent(land[i - 1][j], arr[j - 1], land[i - 1][j - 1]);
        }

        arr[j] = undulate(base);
      }
    }

    land[i] = arr;
  }

  //return land
  //return gaussianBlur(land)
  //return gaussianBlur(gaussianBlur(gaussianBlur(land)));
  return gaussianBlur(
    gaussianBlur(gaussianBlur(gaussianBlur(gaussianBlur(land))))
  );
};

export default createLand;
