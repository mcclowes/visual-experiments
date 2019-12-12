import { randomItem, randomNumber } from "../utils/random";

const HEIGHT = 1000;
const WIDTH = 2000;
const WATER_LEVEL = 110;
const COLORS = ["#FFCC00", "#aaCC00", "#FFaa00", "#FFCCcc"];

export const drawTriangle = context => {
  context.beginPath();

  const x = randomNumber(500);
  const y = randomNumber(500);

  context.moveTo(x, y);
  context.lineTo(x, y + 200);
  context.lineTo(x + 200, y + 200);
  context.closePath();

  // the outline
  context.lineWidth = 1;
  context.strokeStyle = "#666666";
  context.stroke();

  // the fill color
  context.fillStyle = randomItem(COLORS);
  context.fill();
};
