export const TILE_SIZE = 16;
export const GRID_WIDTH = 26;
export const GRID_HEIGHT = 26;
export const CANVAS_WIDTH = TILE_SIZE * GRID_WIDTH;
export const CANVAS_HEIGHT = TILE_SIZE * GRID_HEIGHT;

export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  GRASS = 4,
  BASE = 5,
}
