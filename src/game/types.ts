import { Direction, TileType } from './constants';

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Tank extends Entity {
  direction: Direction;
  speed: number;
  isPlayer: boolean;
  cooldown: number;
  hp: number;
  moving: boolean;
}

export interface Bullet extends Entity {
  direction: Direction;
  speed: number;
  isPlayer: boolean;
  active: boolean;
}

export interface GameState {
  player: Tank | null;
  enemies: Tank[];
  bullets: Bullet[];
  map: TileType[][];
  gameOver: boolean;
  gameWon: boolean;
  score: number;
  baseDestroyed: boolean;
}
