import { randomItem, randomNumber } from "../utils/random";
import rockTypes from "./rockTypes";

const drawLand = (context, geology) => {
  for (let i = 0; i < geology.length - 1; i++) {
    for (let j = 0; j < geology[0].length - 1; j++) {
      context.fillStyle = `rgba(${rockTypes[geology[i][j]].color})`;
      context.fillRect(i, j, 1, 1);
    }
  }
};

export default drawLand;
