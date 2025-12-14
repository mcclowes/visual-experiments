/**
 * AI Location Map Generator
 *
 * Main entry point for AI-powered map generation.
 * Combines the schema, prompts, and API service into a unified interface.
 */

import { getMapService, AnthropicMapService } from './anthropicService';
import schema, {
  TILE_TYPES,
  TERRAIN_TYPES,
  SPATIAL_CONCEPTS,
  FEATURE_PRIMITIVES,
  LOCATION_ARCHETYPES,
  validateGrid,
  ensureBoundaries,
  hasConnectedRegion
} from './schema';
import {
  buildSystemPrompt,
  buildFewShotExamples,
  buildRepairPrompt,
  buildEnhancementPrompt
} from './systemPrompt';

// Re-export everything for external use
export {
  // Schema exports
  TILE_TYPES,
  TERRAIN_TYPES,
  SPATIAL_CONCEPTS,
  FEATURE_PRIMITIVES,
  LOCATION_ARCHETYPES,
  validateGrid,
  ensureBoundaries,
  hasConnectedRegion,

  // Prompt exports
  buildSystemPrompt,
  buildFewShotExamples,
  buildRepairPrompt,
  buildEnhancementPrompt,

  // Service exports
  getMapService,
  AnthropicMapService
};

/**
 * State manager for AI map generation
 * Tracks API key, generation state, and results
 */
class AIMapGeneratorState {
  constructor() {
    this.apiKey = null;
    this.isGenerating = false;
    this.lastDescription = '';
    this.lastResult = null;
    this.history = [];
    this.listeners = new Set();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Get current state
   */
  getState() {
    return {
      apiKey: this.apiKey,
      isGenerating: this.isGenerating,
      lastDescription: this.lastDescription,
      lastResult: this.lastResult,
      history: this.history
    };
  }

  /**
   * Set API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.notify();
  }

  /**
   * Set generating state
   */
  setGenerating(isGenerating) {
    this.isGenerating = isGenerating;
    this.notify();
  }

  /**
   * Store generation result
   */
  setResult(description, result) {
    this.lastDescription = description;
    this.lastResult = result;
    this.history.push({
      timestamp: Date.now(),
      description,
      success: result.success,
      metadata: result.metadata
    });
    this.notify();
  }
}

// Singleton state instance
const generatorState = new AIMapGeneratorState();

/**
 * Main generation function for use with the Tiled component
 *
 * @param {number} tiles - Grid size (e.g., 32)
 * @param {object} options - Generation options
 * @param {string} options.apiKey - Anthropic API key
 * @param {string} options.description - Location description
 * @param {function} options.onProgress - Progress callback
 * @returns {Promise<number[][]>} - The generated grid
 */
export const generateAIMap = async (tiles, options = {}) => {
  const {
    apiKey,
    description = 'A mysterious dungeon with winding corridors and hidden chambers',
    onProgress = null
  } = options;

  // Use provided API key or fall back to state
  const key = apiKey || generatorState.apiKey;

  if (!key) {
    throw new Error('API key required for AI map generation');
  }

  generatorState.setGenerating(true);

  try {
    const service = getMapService(key, { gridSize: tiles });
    const result = await service.generateMap(description, {
      maxRetries: 2,
      onProgress
    });

    generatorState.setResult(description, result);

    if (result.success) {
      return result.grid;
    } else {
      // Return a fallback grid on failure
      console.error('AI map generation failed:', result.error);
      return createFallbackGrid(tiles);
    }
  } finally {
    generatorState.setGenerating(false);
  }
};

/**
 * Create a simple fallback grid when AI generation fails
 */
const createFallbackGrid = (size) => {
  const grid = Array(size).fill(0).map(() => Array(size).fill(0));

  // Create a simple room in the center
  const roomStart = Math.floor(size * 0.25);
  const roomEnd = Math.floor(size * 0.75);

  for (let y = roomStart; y < roomEnd; y++) {
    for (let x = roomStart; x < roomEnd; x++) {
      grid[y][x] = 1; // Floor
    }
  }

  // Add start and end markers
  grid[roomStart + 1][roomStart + 1] = 4; // Start
  grid[roomEnd - 2][roomEnd - 2] = 5; // End

  return grid;
};

/**
 * Get example prompts for the UI
 */
export const getExamplePrompts = () => [
  {
    title: 'Classic Dungeon',
    prompt: 'A sprawling underground dungeon with a grand entrance hall, multiple interconnected chambers, secret passages, and a treasure vault at the deepest point'
  },
  {
    title: 'Medieval Castle',
    prompt: 'A fortified castle with a grand throne room at the center, guard towers at each corner, a banquet hall, armory, and dungeon cells in the basement'
  },
  {
    title: 'Ancient Temple',
    prompt: 'An ancient temple with a symmetrical layout, featuring a sacred altar room at the center, meditation chambers on each side, and a hidden crypt beneath'
  },
  {
    title: 'Tavern & Inn',
    prompt: 'A cozy tavern with a large common room with a central fireplace, a bar area, kitchen, storage cellar, and four private guest rooms upstairs'
  },
  {
    title: 'Wizard Tower',
    prompt: 'A circular wizard tower with a ground floor laboratory, library stacks, summoning chamber, and an observatory at the top with a spiral staircase connecting all levels'
  },
  {
    title: 'Natural Cave',
    prompt: 'A winding natural cave system with organic, irregular passages, a large central cavern with underground lake, crystal grotto, and hidden hermit dwelling'
  },
  {
    title: 'Prison Complex',
    prompt: 'A grim prison with rows of cells along a central corridor, guard stations, interrogation room, warden office, and a secret escape tunnel'
  },
  {
    title: 'Arena',
    prompt: 'A gladiatorial arena with a large open combat pit, spectator areas around the edges, fighter preparation rooms, beast cages, and champion quarters'
  }
];

/**
 * Get the current generator state
 */
export const getGeneratorState = () => generatorState;

/**
 * Set the API key in the global state
 */
export const setApiKey = (apiKey) => {
  generatorState.setApiKey(apiKey);
};

export default {
  generateAIMap,
  getExamplePrompts,
  getGeneratorState,
  setApiKey,
  getMapService,
  schema
};
