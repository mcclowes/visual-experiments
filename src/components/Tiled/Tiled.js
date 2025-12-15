import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { generateSeed } from "./utils/random";
import { exportPNG, exportJSON, exportTMX } from "./utils/export";
import grid from "./grid-large";

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;
const DEFAULT_TILES = 32;

// Generator configurations with seed support
const createGenerators = (seed) => ({
  default: {
    name: "Default Grid",
    description: "Pre-made dungeon grid",
    generate: () => grid,
    isTerrain: false
  },
  caves: {
    name: "Cellular Automata Caves",
    description: "Cave-like structures using cellular automata",
    generate: tiles => generateCaveCellularAutomata(tiles, { seed }),
    isTerrain: false
  },
  wfc: {
    name: "Wave Function Collapse",
    description: "Constraint-based procedural generation",
    generate: tiles => generateWFC(tiles, { seed }),
    isTerrain: false
  },
  drunkard: {
    name: "Drunkard's Walk",
    description: "Random walk carving algorithm",
    generate: tiles => generateDrunkardWalk(tiles, { seed, variant: "weighted" }),
    isTerrain: false
  },
  "drunkard-simple": {
    name: "Drunkard's Walk (Simple)",
    description: "Basic random walk",
    generate: tiles => generateDrunkardWalk(tiles, { seed, variant: "simple" }),
    isTerrain: false
  },
  "drunkard-multi": {
    name: "Drunkard's Walk (Multi)",
    description: "Multiple random walkers",
    generate: tiles => generateDrunkardWalk(tiles, { seed, variant: "multiple", numWalkers: 6 }),
    isTerrain: false
  },
  bsp: {
    name: "BSP Dungeon",
    description: "Binary Space Partitioning rooms & corridors",
    generate: tiles => generateBSP(tiles, { seed }),
    isTerrain: false
  },
  perlin: {
    name: "Perlin Terrain",
    description: "Perlin noise island terrain",
    generate: tiles => generatePerlin(tiles, { seed, islandMode: true }),
    isTerrain: true
  },
  "perlin-continent": {
    name: "Perlin Continent",
    description: "Large-scale terrain without island mask",
    generate: tiles => generatePerlin(tiles, { seed, islandMode: false, scale: 0.04 }),
    isTerrain: true
  },
  maze: {
    name: "Maze (Backtracking)",
    description: "Perfect maze using recursive backtracking",
    generate: tiles => generateMaze(tiles, { seed, algorithm: "backtracking" }),
    isTerrain: false
  },
  "maze-prims": {
    name: "Maze (Prim's)",
    description: "Maze with shorter dead ends",
    generate: tiles => generateMaze(tiles, { seed, algorithm: "prims" }),
    isTerrain: false
  },
  "maze-division": {
    name: "Maze (Division)",
    description: "Recursive division maze",
    generate: tiles => generateMaze(tiles, { seed, algorithm: "division" }),
    isTerrain: false
  },
  "maze-imperfect": {
    name: "Maze (Imperfect)",
    description: "Maze with loops for multiple paths",
    generate: tiles => generateMaze(tiles, { seed, algorithm: "backtracking", loopChance: 0.1 }),
    isTerrain: false
  }
});

const GENERATOR_CATEGORIES = {
  "Dungeon": ["default", "caves", "wfc", "bsp"],
  "Random Walk": ["drunkard", "drunkard-simple", "drunkard-multi"],
  "Terrain": ["perlin", "perlin-continent"],
  "Maze": ["maze", "maze-prims", "maze-division", "maze-imperfect"]
};

// Styled components
const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 1200px;
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
  background: ${props => props.$active ? "#4a90d9" : "#ffffff"};
  color: ${props => props.$active ? "#ffffff" : "#333333"};
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.$active ? "#3a7fc8" : "#e8e8e8"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SettingsPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SettingLabel = styled.label`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 120px;

  &:focus {
    outline: none;
    border-color: #4a90d9;
  }
`;

const InfoPanel = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #4a90d9;
`;

const InfoText = styled.div`
  flex: 1;
  min-width: 200px;
`;

const GeneratorName = styled.span`
  font-weight: 600;
  color: #333;
`;

const GeneratorDesc = styled.span`
  color: #666;
  margin-left: 8px;
`;

const SeedDisplay = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: #888;
  margin-left: 12px;
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$variant === 'primary' ? "#4a90d9" : "#f0f0f0"};
  color: ${props => props.$variant === 'primary' ? "white" : "#333"};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'primary' ? "#3a7fc8" : "#e0e0e0"};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const CanvasContainer = styled.div`
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StyledCanvas = styled.canvas`
  display: block;
  max-width: 100%;
  height: auto;
`;

const Tiled = () => {
  const [gridSize, setGridSize] = useState(DEFAULT_TILES);
  const [seed, setSeed] = useState(generateSeed());
  const [seedInput, setSeedInput] = useState(seed.toString());
  const [generatorType, setGeneratorType] = useState("caves");
  const [currentGrid, setCurrentGrid] = useState(null);

  const canvasRef = useRef(null);

  const canvasWidth = Math.min(DEFAULT_WIDTH, window.innerWidth - 60);
  const canvasHeight = canvasWidth;

  const generators = createGenerators(seed);

  const drawGridToCanvas = useCallback((gridData, genType) => {
    const canvas = canvasRef.current;
    if (!canvas || !gridData) return;

    const context = canvas.getContext("2d");
    const isTerrain = ["perlin", "perlin-continent"].includes(genType);

    if (isTerrain) {
      drawGrid(context, gridData, canvasWidth, canvasHeight, genType);
    } else {
      context.fillStyle = "#2d2d2d";
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      const widthIncrement = canvasWidth / gridData[0].length;
      const heightIncrement = canvasHeight / gridData.length;

      for (let x = 0; x < gridData[0].length; x++) {
        for (let y = 0; y < gridData.length; y++) {
          drawTile(context, widthIncrement, heightIncrement)(x, y, gridData);
        }
      }
    }
  }, [canvasWidth, canvasHeight]);

  const createGrid = useCallback((type, newSeed) => {
    const effectiveSeed = newSeed ?? seed;
    const gens = createGenerators(effectiveSeed);
    const generator = gens[type];

    if (!generator) {
      console.error(`Unknown generator type: ${type}`);
      return;
    }

    const newGrid = generator.generate(gridSize);
    setCurrentGrid(newGrid);
    setGeneratorType(type);

    drawGridToCanvas(newGrid, type);
  }, [seed, gridSize, drawGridToCanvas]);

  const regenerate = useCallback(() => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    setSeedInput(newSeed.toString());
    createGrid(generatorType, newSeed);
  }, [generatorType, createGrid]);

  const applySeed = useCallback(() => {
    const parsed = parseInt(seedInput, 10);
    if (!isNaN(parsed)) {
      setSeed(parsed);
      createGrid(generatorType, parsed);
    }
  }, [seedInput, generatorType, createGrid]);

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportPNG(canvasRef.current, `map-${generatorType}-${seed}.png`);
    }
  };

  const handleExportJSON = () => {
    if (currentGrid) {
      exportJSON(currentGrid, {
        generator: generatorType,
        seed,
        gridSize
      }, `map-${generatorType}-${seed}.json`);
    }
  };

  const handleExportTMX = () => {
    if (currentGrid) {
      const isTerrain = ["perlin", "perlin-continent"].includes(generatorType);
      exportTMX(currentGrid, {
        filename: `map-${generatorType}-${seed}.tmx`,
        tilesetName: isTerrain ? 'terrain' : 'dungeon',
        isTerrain
      });
    }
  };

  useEffect(() => {
    createGrid(generatorType, seed);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentGenerator = generators[generatorType];

  return (
    <Container>
      <Title>Procedural Map Generator</Title>

      <SettingsPanel>
        <SettingGroup>
          <SettingLabel>Grid Size</SettingLabel>
          <Input
            type="number"
            min="8"
            max="128"
            value={gridSize}
            onChange={e => setGridSize(Math.max(8, Math.min(128, parseInt(e.target.value) || 32)))}
            onBlur={() => createGrid(generatorType)}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>Seed</SettingLabel>
          <Input
            type="text"
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && applySeed()}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>&nbsp;</SettingLabel>
          <ActionButton onClick={applySeed}>Apply Seed</ActionButton>
        </SettingGroup>
      </SettingsPanel>

      <Controls>
        {Object.entries(GENERATOR_CATEGORIES).map(([category, gens]) => (
          <CategorySection key={category}>
            <CategoryTitle>{category}</CategoryTitle>
            <ButtonGroup>
              {gens.map(genType => (
                <GeneratorButton
                  key={genType}
                  $active={generatorType === genType}
                  onClick={() => createGrid(genType)}
                >
                  {generators[genType].name}
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
          <SeedDisplay>Seed: {seed}</SeedDisplay>
        </InfoText>
        <ButtonRow>
          <ActionButton $variant="primary" onClick={regenerate}>
            ↻ Regenerate
          </ActionButton>
          <ActionButton onClick={handleExportPNG}>
            PNG
          </ActionButton>
          <ActionButton onClick={handleExportJSON}>
            JSON
          </ActionButton>
          <ActionButton onClick={handleExportTMX}>
            TMX
          </ActionButton>
        </ButtonRow>
      </InfoPanel>

      <CanvasContainer>
        <StyledCanvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
      </CanvasContainer>
    </Container>
  );
};

export default Tiled;
