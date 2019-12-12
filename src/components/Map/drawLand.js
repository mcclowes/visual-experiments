import { randomItem, randomNumber } from "./utils/random";

const drawLand = (context, land, waterLevel) => {
  for (let i = 0; i < land.length - 1; i++) {
    for (let j = 0; j < land[0].length - 1; j++) {
      if (land[i][j] <= waterLevel) {
        context.fillStyle = `rgba(${10}, ${10}, ${125}, 1`;
      } else if (land[i][j] % 20 === 0) {
        context.fillStyle = `rgba(${255}, ${125}, ${125}, 1`;
      } else {
        context.fillStyle = `rgba(${125 + land[i][j] / 5}, ${225}, ${125 +
          land[i][j] / 5}, ${land[i][j] / 255}`;
      }
      context.fillRect(i, j, 1, 1);
    }
  }
};

export default drawLand;
