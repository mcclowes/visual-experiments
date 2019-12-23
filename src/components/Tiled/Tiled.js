import React, { Component } from "react";
import grid from "./grid-large";
//import grid from './grid-medium'
import drawTile from "./draw/tile";
import generateCaveCellularAutomata from "./generate/cave";
import { randomNumber } from "./utils/random";

const HEIGHT = 700;
const WIDTH = 700;
const TILES_X = 32;
const TILES_Y = 32;

// const grid = [
//   [0,0,0,0],
//   [0,1,1,1],
//   [0,1,1,0],
//   [0,0,0,1],
// ]

const generateGrid = (tiles, type) => {
  if (type === "caves") {
    return generateCaveCellularAutomata(tiles);
  }

  if (type === "random") {
    const basegrid = Array(tiles)
      .fill(0)
      .map(_ => Array(tiles).fill(0));
    const grid = basegrid.map(arr => arr.map(_ => randomNumber(3)));
  }

  return grid;
};

class Tiled extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: HEIGHT,
      width: WIDTH,
      tilesX: TILES_X,
      tilesY: TILES_Y,
      grid: undefined
    };

    this.createGrid = this.createGrid.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
  }

  componentDidMount() {
    this.createGrid();
  }

  createGrid(type = "default") {
    const grid = generateGrid(this.state.tilesX, type);

    this.setState({
      grid: grid
    });

    this.drawGrid(grid, this.state.width, this.state.height);
  }

  drawGrid(grid, height, width) {
    const canvas = this.refs.canvas;

    const context = canvas.getContext("2d");
    context.fillStyle = "#fefef4";
    context.fillRect(0, 0, width, height);

    const widthIncrement = width / grid[0].length;
    const heightIncrement = height / grid.length;

    for (let x = 0; x < grid[0].length; x++) {
      for (let y = 0; y < grid.length; y++) {
        drawTile(context, widthIncrement, heightIncrement)(x, y, grid);
      }
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.createGrid}>Generate default map</button>

        <button onClick={() => this.createGrid("caves")}>Generate caves</button>

        <button onClick={() => this.createGrid("random")}>
          Generate random
        </button>

        <canvas ref="canvas" width={WIDTH} height={HEIGHT} />
      </div>
    );
  }
}

export default Tiled;
