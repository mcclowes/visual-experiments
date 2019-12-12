import createLand from "./createLand";
import drawLand from "./drawLand";
import React, { Component } from "react";
import { randomItem, randomNumber } from "./utils/random";
import { drawTriangle, drawHouse, drawRiver } from "./draw";

const HEIGHT = 1000;
const WIDTH = 2000;
const WATER_LEVEL = 110;
const COLORS = ["#FFCC00", "#aaCC00", "#FFaa00", "#FFCCcc"];

class Map extends Component {
  componentDidMount() {
    const canvas = this.refs.canvas;

    const context = canvas.getContext("2d");

    context.fillText(this.props.text, 210, 75);

    const land = createLand(HEIGHT, WIDTH);

    drawLand(context, land, WATER_LEVEL);

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
