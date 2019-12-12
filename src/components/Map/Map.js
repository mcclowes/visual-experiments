import React, { Component } from "react";

const HEIGHT = 1000;
const WIDTH = 2000;

const WATER_LEVEL = 100;

const colors = ["#FFCC00", "#aaCC00", "#FFaa00", "#FFCCcc"];

const randomItem = list => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

const randomNumber = max => Math.floor(Math.random() * max + 1);

const drawTriangle = context => {
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
  context.fillStyle = randomItem(colors);
  context.fill();
};

const drawHouse = context => {
  context.beginPath();

  const x = randomNumber(500);
  const y = randomNumber(500);

  context.moveTo(x, y);
  context.lineTo(x, y + 20);
  context.lineTo(x + 10, y + 20);
  context.lineTo(x + 10, y);
  context.closePath();

  // the outline
  context.lineWidth = 1;
  context.strokeStyle = "#666666";
  context.stroke();

  // the fill color
  context.fillStyle = randomItem(colors);
  context.fill();
};

const drawRiver = context => {
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

const applyLens = (size, array, i, j) => {
  return (
    array[i - 1][j - 1] * 0.03125 + // 3 -
    array[i - 1][j] * 0.125 + // 2 -
    array[i - 1][j + 1] * 0.03125 + // 3 -
    array[i][j - 1] * 0.125 + // 2 -
    array[i][j] * 0.375 + // 1 - 0.25
    array[i][j + 1] * 0.125 + // 2 -
    array[i + 1][j - 1] * 0.03125 + // 3 -
    array[i + 1][j] * 0.125 + // 2 -
    array[i + 1][j + 1] * 0.03125
  ); // 3 -
};

const gaussianBlur = arr => {
  let matrix = arr;

  for (let i = 0; i < matrix.length - 1; i++) {
    for (let j = 0; j < matrix[0].length - 1; j++) {
      if (i === 0 || j === 0 || i === matrix.length || j === matrix[0].length) {
        matrix[i][j] = matrix[i][j];
      } else {
        matrix[i][j] = Math.round(applyLens(3, arr, i, j));
      }
    }
  }

  return matrix;
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
          base = (land[i - 1][j] + arr[j - 1] + land[i - 1][j - 1]) / 3;
        }

        arr[j] =
          randomNumber(2) === 1
            ? base - randomNumber(2)
            : base + randomNumber(2);
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

const drawLand = (context, land) => {
  for (let i = 0; i < land.length - 1; i++) {
    for (let j = 0; j < land[0].length - 1; j++) {
      if (land[i][j] <= WATER_LEVEL) {
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

class Map extends Component {
  componentDidMount() {
    const canvas = this.refs.canvas;

    const context = canvas.getContext("2d");

    context.fillText(this.props.text, 210, 75);

    const land = createLand(HEIGHT, WIDTH);
    console.log(land);
    drawLand(context, land);

    drawHouse(context);
    drawHouse(context);
    drawHouse(context);
    drawHouse(context);
    drawHouse(context);
    drawHouse(context);

    drawRiver(context);
  }

  render() {
    return (
      <div>
        <canvas ref="canvas" width={WIDTH} height={HEIGHT} />
      </div>
    );
  }
}

export default Map;
