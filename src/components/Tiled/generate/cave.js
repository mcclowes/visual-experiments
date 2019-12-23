import { sumLens } from "../utils/imaging";
import { randomNumber } from "../utils/random";

const sq = radius => (radius * 2 + 1) ** 2;

const apply45Switch = (grid, i, j) => {
  const isolated = sumLens(grid, i, j, 2) === 0;
  return isolated ? 1 : Math.round(sumLens(grid, i, j, 1) / sq(1));
};

const apply45Rule = grid => {
  return grid.map((y, j) => {
    return y.map((_, i) => {
      if (i === 0 || j === 0 || i === y.length - 1 || j === grid.length - 1) {
        return 0;
      }

      return apply45Switch(grid, i, j);
    });
  });
};

//http://roguebasin.roguelikedevelopment.org/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
const generateCaveCellularAutomata = tiles => {
  const basegrid = Array(tiles)
    .fill(0)
    .map(_ => Array(tiles).fill(0));
  const grid = basegrid.map(arr => arr.map(_ => randomNumber(1, 0)));
  const mergedGrid = apply45Rule(apply45Rule(apply45Rule(grid)));

  return mergedGrid;
};

export default generateCaveCellularAutomata;
