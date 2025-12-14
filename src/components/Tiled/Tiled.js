import React, { Component } from "react";
import styled from "styled-components";

// Generators
import generateCaveCellularAutomata from "./generate/cave";
import generateWFC from "./generate/wfc";
import generateDrunkardWalk from "./generate/drunkardWalk";
import generateBSP from "./generate/bsp";
import generatePerlin from "./generate/perlin";
import generateMaze from "./generate/maze";

// Drawing
import drawGrid from "./draw/drawGrid";
import drawTile from "./draw/tile";

// Utils
import { randomNumber } from "./utils/random";
import grid from "./grid-large";

const HEIGHT = 700;
const WIDTH = 700;
const TILES_X = 32;
const TILES_Y = 32;

// Generator configurations
const GENERATORS = {
  default: {
    name: "Default Grid",
    description: "Pre-made dungeon grid",
    generate: () => grid
  },
  caves: {
    name: "Cellular Automata Caves",
    description: "Cave-like structures using cellular automata",
    generate: tiles => generateCaveCellularAutomata(tiles)
  },
  wfc: {
    name: "Wave Function Collapse",
    description: "Constraint-based procedural generation",
    generate: tiles => generateWFC(tiles)
  },
  drunkard: {
    name: "Drunkard's Walk",
    description: "Random walk carving algorithm",
    generate: tiles => generateDrunkardWalk(tiles, { variant: "weighted" })
  },
  "drunkard-simple": {
    name: "Drunkard's Walk (Simple)",
    description: "Basic random walk",
    generate: tiles => generateDrunkardWalk(tiles, { variant: "simple" })
  },
  "drunkard-multi": {
    name: "Drunkard's Walk (Multi)",
    description: "Multiple random walkers",
    generate: tiles => generateDrunkardWalk(tiles, { variant: "multiple", numWalkers: 6 })
  },
  bsp: {
    name: "BSP Dungeon",
    description: "Binary Space Partitioning rooms & corridors",
    generate: tiles => generateBSP(tiles)
  },
  perlin: {
    name: "Perlin Terrain",
    description: "Perlin noise island terrain",
    generate: tiles => generatePerlin(tiles, { islandMode: true })
  },
  "perlin-continent": {
    name: "Perlin Continent",
    description: "Large-scale terrain without island mask",
    generate: tiles => generatePerlin(tiles, { islandMode: false, scale: 0.04 })
  },
  maze: {
    name: "Maze (Backtracking)",
    description: "Perfect maze using recursive backtracking",
    generate: tiles => generateMaze(tiles, { algorithm: "backtracking" })
  },
  "maze-prims": {
    name: "Maze (Prim's)",
    description: "Maze with shorter dead ends",
    generate: tiles => generateMaze(tiles, { algorithm: "prims" })
  },
  "maze-division": {
    name: "Maze (Division)",
    description: "Recursive division maze",
    generate: tiles => generateMaze(tiles, { algorithm: "division" })
  },
  "maze-imperfect": {
    name: "Maze (Imperfect)",
    description: "Maze with loops for multiple paths",
    generate: tiles => generateMaze(tiles, { algorithm: "backtracking", loopChance: 0.1 })
  },
  random: {
    name: "Random",
    description: "Random tile distribution",
    generate: tiles => {
      return Array(tiles)
        .fill(0)
        .map(_ => Array(tiles).fill(0).map(_ => randomNumber(3, 0)));
    }
  }
};

// Generator categories for UI organization
const GENERATOR_CATEGORIES = {
  "Dungeon": ["default", "caves", "wfc", "bsp"],
  "Random Walk": ["drunkard", "drunkard-simple", "drunkard-multi"],
  "Terrain": ["perlin", "perlin-continent"],
  "Maze": ["maze", "maze-prims", "maze-division", "maze-imperfect"],
  "Other": ["random"]
};

// Styled components
const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Title = styled.h1`
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const CategorySection = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
`;

const CategoryTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GeneratorButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? "#4a90d9" : "#ffffff"};
  color: ${props => props.active ? "#ffffff" : "#333333"};
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.active ? "#3a7fc8" : "#e8e8e8"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const InfoPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #4a90d9;
`;

const InfoText = styled.div`
  flex: 1;
`;

const GeneratorName = styled.span`
  font-weight: 600;
  color: #333;
`;

const GeneratorDesc = styled.span`
  color: #666;
  margin-left: 8px;
`;

const RegenerateButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #4a90d9;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #3a7fc8;
  }
`;

const CanvasContainer = styled.div`
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StyledCanvas = styled.canvas`
  display: block;
`;

class Tiled extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: HEIGHT,
      width: WIDTH,
      tilesX: TILES_X,
      tilesY: TILES_Y,
      grid: undefined,
      generatorType: "caves"
    };

    this.canvasRef = React.createRef();
    this.createGrid = this.createGrid.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
  }

  componentDidMount() {
    this.createGrid(this.state.generatorType);
  }

  createGrid(type = "default") {
    const generator = GENERATORS[type];
    if (!generator) {
      console.error(`Unknown generator type: ${type}`);
      return;
    }

    const grid = generator.generate(this.state.tilesX);

    this.setState({
      grid: grid,
      generatorType: type
    });

    this.drawGrid(grid, this.state.width, this.state.height, type);
  }

  drawGrid(grid, width, height, generatorType) {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");

    // Perlin terrain uses specialized terrain renderer
    if (["perlin", "perlin-continent"].includes(generatorType)) {
      drawGrid(context, grid, width, height, generatorType);
    } else {
      // All dungeon-style generators use the unified drawTile renderer
      // Darker background with subtle blue tint for depth
      context.fillStyle = "#252830";
      context.fillRect(0, 0, width, height);

      const widthIncrement = width / grid[0].length;
      const heightIncrement = height / grid.length;

      for (let x = 0; x < grid[0].length; x++) {
        for (let y = 0; y < grid.length; y++) {
          drawTile(context, widthIncrement, heightIncrement)(x, y, grid);
        }
      }
    }
  }

  render() {
    const currentGenerator = GENERATORS[this.state.generatorType];

    return (
      <Container>
        <Title>Procedural Map Generator</Title>

        <Controls>
          {Object.entries(GENERATOR_CATEGORIES).map(([category, generators]) => (
            <CategorySection key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <ButtonGroup>
                {generators.map(genType => (
                  <GeneratorButton
                    key={genType}
                    active={this.state.generatorType === genType}
                    onClick={() => this.createGrid(genType)}
                  >
                    {GENERATORS[genType].name}
                  </GeneratorButton>
                ))}
              </ButtonGroup>
            </CategorySection>
          ))}
        </Controls>

        <InfoPanel>
          <InfoText>
            <GeneratorName>{currentGenerator?.name}</GeneratorName>
            <GeneratorDesc>— {currentGenerator?.description}</GeneratorDesc>
          </InfoText>
          <RegenerateButton onClick={() => this.createGrid(this.state.generatorType)}>
            ↻ Regenerate
          </RegenerateButton>
        </InfoPanel>

        <CanvasContainer>
          <StyledCanvas ref={this.canvasRef} width={WIDTH} height={HEIGHT} />
        </CanvasContainer>
      </Container>
    );
  }
}

export default Tiled;
