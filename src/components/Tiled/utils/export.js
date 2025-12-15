/**
 * Export utilities for map data
 *
 * Supports exporting maps to:
 * - PNG image
 * - JSON (raw grid data)
 * - TMX (Tiled Map Editor format)
 */

import { TILES, TILE_INFO, TERRAIN, TERRAIN_INFO } from '../constants/tiles';

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export canvas as PNG image
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} [filename='map.png'] - Output filename
 */
export const exportPNG = (canvas, filename = 'map.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export grid data as JSON
 * @param {number[][]} grid - The tile grid
 * @param {object} metadata - Additional metadata to include
 * @param {string} [filename='map.json'] - Output filename
 */
export const exportJSON = (grid, metadata = {}, filename = 'map.json') => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    width: grid[0].length,
    height: grid.length,
    ...metadata,
    grid
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

/**
 * Export as Tiled Map Editor TMX format
 * @param {number[][]} grid - The tile grid
 * @param {object} options - Export options
 * @param {string} [options.filename='map.tmx'] - Output filename
 * @param {string} [options.tilesetName='dungeon'] - Tileset name
 * @param {number} [options.tileWidth=32] - Tile width in pixels
 * @param {number} [options.tileHeight=32] - Tile height in pixels
 * @param {boolean} [options.isTerrain=false] - Whether this is terrain data
 */
export const exportTMX = (grid, options = {}) => {
  const {
    filename = 'map.tmx',
    tilesetName = 'dungeon',
    tileWidth = 32,
    tileHeight = 32,
    isTerrain = false
  } = options;

  const width = grid[0].length;
  const height = grid.length;

  // TMX uses 1-based tile IDs, 0 means empty
  // We'll map our tile types to sequential IDs
  const tileTypes = isTerrain ? TERRAIN : TILES;
  const tileCount = Object.keys(tileTypes).length;

  // Convert grid to CSV format (TMX data format)
  // Add 1 to each tile ID since TMX uses 1-based indexing
  const csvData = grid.map(row =>
    row.map(tile => tile + 1).join(',')
  ).join(',\n');

  // Generate tileset properties
  const tileProperties = Object.entries(isTerrain ? TERRAIN_INFO : TILE_INFO)
    .map(([id, info]) => `
   <tile id="${id}">
    <properties>
     <property name="name" value="${info.name}"/>
     <property name="walkable" type="bool" value="${info.walkable}"/>
    </properties>
   </tile>`).join('');

  const tmx = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="${tileWidth}" tileheight="${tileHeight}" infinite="0" nextlayerid="2" nextobjectid="1">
 <tileset firstgid="1" name="${tilesetName}" tilewidth="${tileWidth}" tileheight="${tileHeight}" tilecount="${tileCount}" columns="0">
  <grid orientation="orthogonal" width="1" height="1"/>
${tileProperties}
 </tileset>
 <layer id="1" name="Tile Layer 1" width="${width}" height="${height}">
  <data encoding="csv">
${csvData}
  </data>
 </layer>
</map>`;

  downloadFile(tmx, filename, 'application/xml');
};

/**
 * Export grid as ASCII art
 * @param {number[][]} grid - The tile grid
 * @param {boolean} [isTerrain=false] - Whether this is terrain data
 * @returns {string} ASCII representation
 */
export const exportASCII = (grid, isTerrain = false) => {
  const symbols = isTerrain
    ? { 0: '~', 1: '≈', 2: '.', 3: '"', 4: '♣', 5: '▲' }
    : { 0: '#', 1: '.', 2: '+', 3: 'S', 4: '@', 5: 'X', 6: ',' };

  return grid.map(row =>
    row.map(tile => symbols[tile] || '?').join('')
  ).join('\n');
};

/**
 * Export grid as ASCII art to file
 * @param {number[][]} grid - The tile grid
 * @param {boolean} [isTerrain=false] - Whether this is terrain data
 * @param {string} [filename='map.txt'] - Output filename
 */
export const exportASCIIFile = (grid, isTerrain = false, filename = 'map.txt') => {
  const ascii = exportASCII(grid, isTerrain);
  downloadFile(ascii, filename, 'text/plain');
};

/**
 * Generate a data URL for the canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} [type='image/png'] - Image MIME type
 * @param {number} [quality=0.92] - Image quality (for JPEG)
 * @returns {string} Data URL
 */
export const getDataURL = (canvas, type = 'image/png', quality = 0.92) => {
  return canvas.toDataURL(type, quality);
};

/**
 * Copy grid data to clipboard as JSON
 * @param {number[][]} grid - The tile grid
 * @param {object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (grid, metadata = {}) => {
  const data = {
    width: grid[0].length,
    height: grid.length,
    ...metadata,
    grid
  };

  const json = JSON.stringify(data);
  await navigator.clipboard.writeText(json);
};

/**
 * Import grid from JSON string
 * @param {string} jsonString - JSON string containing grid data
 * @returns {{grid: number[][], metadata: object}|null}
 */
export const importJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.grid || !Array.isArray(data.grid)) {
      throw new Error('Invalid grid data');
    }
    const { grid, ...metadata } = data;
    return { grid, metadata };
  } catch (error) {
    console.error('Failed to import JSON:', error);
    return null;
  }
};

/**
 * Create a thumbnail of the map
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} [maxSize=128] - Maximum dimension
 * @returns {string} Data URL of thumbnail
 */
export const createThumbnail = (sourceCanvas, maxSize = 128) => {
  const scale = Math.min(maxSize / sourceCanvas.width, maxSize / sourceCanvas.height);
  const width = Math.floor(sourceCanvas.width * scale);
  const height = Math.floor(sourceCanvas.height * scale);

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = width;
  thumbCanvas.height = height;

  const ctx = thumbCanvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  return thumbCanvas.toDataURL('image/png');
};
