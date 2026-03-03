import { TileType, GRID_WIDTH, GRID_HEIGHT } from './constants';

export function createInitialMap(): TileType[][] {
  const map: TileType[][] = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(TileType.EMPTY));

  // Create a classic-like layout
  for (let y = 2; y < GRID_HEIGHT - 2; y++) {
    for (let x = 2; x < GRID_WIDTH - 2; x += 4) {
      if (y === 13 || y === 14) continue;
      map[y][x] = TileType.BRICK;
      map[y][x + 1] = TileType.BRICK;
    }
  }

  // Steel blocks
  map[13][12] = TileType.STEEL;
  map[13][13] = TileType.STEEL;
  map[14][12] = TileType.STEEL;
  map[14][13] = TileType.STEEL;

  // Base protection
  map[23][11] = TileType.BRICK;
  map[23][12] = TileType.BRICK;
  map[23][13] = TileType.BRICK;
  map[23][14] = TileType.BRICK;
  map[24][11] = TileType.BRICK;
  map[24][14] = TileType.BRICK;
  map[25][11] = TileType.BRICK;
  map[25][14] = TileType.BRICK;

  // Base
  map[24][12] = TileType.BASE;
  map[24][13] = TileType.BASE;
  map[25][12] = TileType.BASE;
  map[25][13] = TileType.BASE;

  return map;
}
