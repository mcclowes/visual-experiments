/**
 * Anthropic API Service for Map Generation
 *
 * This module handles communication with Anthropic's Claude API
 * to generate maps from natural language descriptions.
 */

import { buildSystemPrompt, buildRepairPrompt } from './systemPrompt';
import { validateGrid, ensureBoundaries } from './schema';

// Default configuration
const DEFAULT_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 8192,
  temperature: 0.7,
  gridSize: 32
};

/**
 * Anthropic API client for map generation
 */
class AnthropicMapService {
  constructor(apiKey, config = {}) {
    this.apiKey = apiKey;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  /**
   * Set or update the API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Make a request to the Anthropic API
   */
  async makeRequest(messages, systemPrompt) {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Parse the AI response to extract the grid
   */
  parseResponse(response) {
    // Get the text content from the response
    const content = response.content?.[0]?.text;
    if (!content) {
      throw new Error('No content in API response');
    }

    // Try to parse as JSON
    try {
      // Clean the response - remove any markdown code blocks if present
      let cleanContent = content.trim();

      // Remove markdown code fences if present
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanContent);

      if (!parsed.grid) {
        throw new Error('Response missing grid property');
      }

      return parsed;
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          if (extracted.grid) {
            return extracted;
          }
        } catch {
          // Fall through to error
        }
      }

      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  }

  /**
   * Generate a map from a location description
   */
  async generateMap(description, options = {}) {
    const {
      maxRetries = 2,
      onProgress = null
    } = options;

    const gridSize = this.config.gridSize;
    const systemPrompt = buildSystemPrompt(gridSize);

    // Initial generation request
    const messages = [
      { role: 'user', content: description }
    ];

    onProgress?.({ stage: 'generating', message: 'Sending request to AI...' });

    let lastError = null;
    let lastResponse = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        onProgress?.({
          stage: attempt === 0 ? 'generating' : 'repairing',
          message: attempt === 0 ? 'Generating map...' : `Retry attempt ${attempt}...`,
          attempt
        });

        const response = await this.makeRequest(messages, systemPrompt);
        const parsed = this.parseResponse(response);

        // Validate the grid
        const validation = validateGrid(parsed.grid, gridSize);

        if (validation.valid) {
          // Ensure boundaries are walls
          ensureBoundaries(parsed.grid);

          onProgress?.({ stage: 'complete', message: 'Map generated successfully!' });

          return {
            success: true,
            grid: parsed.grid,
            metadata: parsed.metadata || {},
            attempts: attempt + 1
          };
        }

        // Grid is invalid - prepare for retry
        lastError = validation.errors;
        lastResponse = parsed;

        if (attempt < maxRetries) {
          // Add repair message
          messages.push({
            role: 'assistant',
            content: JSON.stringify(parsed)
          });
          messages.push({
            role: 'user',
            content: buildRepairPrompt(description, parsed, validation.errors)
          });
        }
      } catch (error) {
        lastError = [error.message];

        if (attempt < maxRetries) {
          onProgress?.({
            stage: 'error',
            message: `Error: ${error.message}. Retrying...`,
            attempt
          });
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All retries exhausted
    onProgress?.({ stage: 'failed', message: 'Failed to generate valid map' });

    return {
      success: false,
      error: lastError?.join('; ') || 'Unknown error',
      partialGrid: lastResponse?.grid,
      attempts: maxRetries + 1
    };
  }

  /**
   * Enhance an existing map with additional features
   */
  async enhanceMap(currentGrid, enhancement, options = {}) {
    const gridSize = this.config.gridSize;
    const systemPrompt = buildSystemPrompt(gridSize);

    const messages = [
      {
        role: 'user',
        content: `Current map (as reference):
${JSON.stringify({ grid: currentGrid })}

Enhancement request: ${enhancement}

Generate an updated map incorporating this enhancement while preserving the overall structure.`
      }
    ];

    const response = await this.makeRequest(messages, systemPrompt);
    const parsed = this.parseResponse(response);

    const validation = validateGrid(parsed.grid, gridSize);

    if (validation.valid) {
      ensureBoundaries(parsed.grid);
      return {
        success: true,
        grid: parsed.grid,
        metadata: parsed.metadata || {}
      };
    }

    return {
      success: false,
      error: validation.errors.join('; ')
    };
  }
}

/**
 * Create a singleton service instance
 */
let serviceInstance = null;

export const getMapService = (apiKey, config) => {
  if (!serviceInstance) {
    serviceInstance = new AnthropicMapService(apiKey, config);
  } else if (apiKey) {
    serviceInstance.setApiKey(apiKey);
  }
  return serviceInstance;
};

export { AnthropicMapService };
export default AnthropicMapService;
