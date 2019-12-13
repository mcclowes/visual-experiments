import React, { Component } from "react";
import { createGeology, drawGeology } from "./geology";
import { createLand, drawLand } from "./land";
import { drawTriangle, drawHouse, drawRiver } from "./draw";
import { randomItem, randomNumber } from "./utils/random";

const HEIGHT = 400;
const WIDTH = 400;
const WATER_LEVEL = 110;

class Map extends Component {
  componentDidMount() {
    const canvas = this.refs.canvas;

    const context = canvas.getContext("2d");

    const geology = createGeology(HEIGHT, WIDTH);
    //drawGeology(context, geology);

    const land = createLand(geology);
    //drawLand(context, land, WATER_LEVEL);
    drawLand(context, land, WATER_LEVEL, false, false);
    console.log(land);
    //     drawHouse(context);
    //     drawHouse(context);
    //     drawHouse(context);
    //     drawHouse(context);
    //     drawHouse(context);
    //     drawHouse(context);
    //
    //     drawRiver(context);
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
