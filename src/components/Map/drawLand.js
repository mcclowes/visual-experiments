import { randomItem, randomNumber } from "./utils/random";

const landColor = (height, heatMap) => {
  if (heatMap) {
    if (height > 220) {
      return `rgba(185, 10, 10, 0.8`;
    } else if (height >= 200) {
      return `rgba(185, 50, 50, 0.8`;
    } else if (height >= 180) {
      return `rgba(185, 100, 100, 0.8`;
    } else if (height >= 160) {
      return `rgba(185, 10, 10, 0.8`;
    } else if (height >= 140) {
      return `rgba(10, 185, 10, 0.8`;
    } else if (height >= 120) {
      return `rgba(10, 185, 185, 0.8`;
    } else if (height >= 100) {
      return `rgba(10, 10, 185, 0.8`;
    }
  }

  return `rgba(${125 + height / 5}, ${225}, ${125 + height / 5}, ${height /
    255}`;
};

const drawLand = (
  context,
  land,
  waterLevel,
  heatMap = true,
  contours = true
) => {
  for (let i = 0; i < land.length - 1; i++) {
    for (let j = 0; j < land[0].length - 1; j++) {
      if (land[i][j] <= waterLevel) {
        context.fillStyle = `rgba(${10}, ${10}, ${125}, 1`;
      } else if (land[i][j] % 20 === 0 && contours === true) {
        context.fillStyle = `rgba(${255}, ${125}, ${125}, 1`;
      } else {
        context.fillStyle = landColor(land[i][j], heatMap);
      }
      context.fillRect(i, j, 1, 1);
    }
  }
};

export default drawLand;
