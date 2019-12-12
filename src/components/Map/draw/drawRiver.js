import { randomItem, randomNumber } from "../utils/random";

const HEIGHT = 1000;
const WIDTH = 2000;
const WATER_LEVEL = 110;
const COLORS = ["#FFCC00", "#aaCC00", "#FFaa00", "#FFCCcc"];

export const drawRiver = context => {
  context.beginPath();

  let x = 0;
  let y = 0;
  let angle = 45;
  let weight = 1000;

  for (let i = 0; i < 100; i++) {
    context.moveTo(x, y);

    x = x + randomNumber(10);
    y = y + randomNumber(10);

    context.lineTo(x, y);

    if (Math.floor(weight / 100) !== Math.floor((weight - 10) / 100)) {
      context.lineWidth = Math.floor(weight / 100);
      context.strokeStyle = "#000066";
      context.stroke();
    }

    weight = weight - 10;
  }
};
