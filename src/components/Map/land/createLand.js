import { randomItem, randomNumber } from "../utils/random";
import { gaussianBlur } from "../utils/imaging";
import rockTypes from "../geology/rockTypes";

const selectParent = (parentTop, parentLeft, parentTopLeft) => {
  const rand = randomNumber(7);

  if (rand === 1) {
    return parentTop;
  } else if (rand === 2) {
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
  const rand = randomNumber(2);

  if (rand === 1) {
    return base - randomNumber(5);
  } else {
    return base + randomNumber(2);
  }
};

const createLand = geology => {
  const land = geology.map((x, i) =>
    x.map((y, j) => rockTypes[y].hardness * 150)
  );

  const undulatedLand = land.map(x => x.map(y => undulate(y)));

  //return land;
  //return gaussianBlur(land);
  return gaussianBlur(
    gaussianBlur(gaussianBlur(gaussianBlur(gaussianBlur(land))))
  );
};

export default createLand;
