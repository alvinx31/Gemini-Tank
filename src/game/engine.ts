import { GameState, Tank, Bullet } from './types';
import { Direction, TileType, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { createInitialMap } from './map';

const PLAYER_SPEED = 2;
const ENEMY_SPEED = 1;
const BULLET_SPEED = 4;
const TANK_SIZE = TILE_SIZE * 2 - 2; // Slightly smaller than 2 tiles to fit through gaps
const BULLET_SIZE = 4;

export class GameEngine {
  state: GameState;
  keys: { [key: string]: boolean } = {};
  lastTime: number = 0;
  enemySpawnTimer: number = 0;

  constructor() {
    this.state = this.getInitialState();
  }

  getInitialState(): GameState {
    return {
      player: {
        x: 8 * TILE_SIZE + 1,
        y: 24 * TILE_SIZE + 1,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: Direction.UP,
        speed: PLAYER_SPEED,
        isPlayer: true,
        cooldown: 0,
        hp: 1,
        moving: false,
      },
      enemies: [],
      bullets: [],
      map: createInitialMap(),
      gameOver: false,
      gameWon: false,
      score: 0,
      baseDestroyed: false,
    };
  }

  reset() {
    this.state = this.getInitialState();
    this.keys = {};
    this.enemySpawnTimer = 0;
  }

  handleKeyDown(key: string) {
    this.keys[key] = true;
  }

  handleKeyUp(key: string) {
    this.keys[key] = false;
  }

  update(deltaTime: number) {
    if (this.state.gameOver || this.state.gameWon) return;

    this.updatePlayer();
    this.updateEnemies(deltaTime);
    this.updateBullets();
    this.checkCollisions();
  }

  updatePlayer() {
    const p = this.state.player;
    if (!p) return;

    if (p.cooldown > 0) p.cooldown--;

    let dx = 0;
    let dy = 0;
    p.moving = false;

    if (this.keys['ArrowUp'] || this.keys['w']) {
      dy = -p.speed;
      p.direction = Direction.UP;
      p.moving = true;
    } else if (this.keys['ArrowDown'] || this.keys['s']) {
      dy = p.speed;
      p.direction = Direction.DOWN;
      p.moving = true;
    } else if (this.keys['ArrowLeft'] || this.keys['a']) {
      dx = -p.speed;
      p.direction = Direction.LEFT;
      p.moving = true;
    } else if (this.keys['ArrowRight'] || this.keys['d']) {
      dx = p.speed;
      p.direction = Direction.RIGHT;
      p.moving = true;
    }

    // Snap to grid slightly to help going through corridors
    if (p.direction === Direction.UP || p.direction === Direction.DOWN) {
        if (dx === 0 && p.moving) {
            const centerX = p.x + p.width / 2;
            const tileX = Math.floor(centerX / TILE_SIZE) * TILE_SIZE;
            const diff = p.x - tileX;
            if (Math.abs(diff) < 4) {
                p.x = tileX + 1;
            } else if (Math.abs(diff - TILE_SIZE) < 4) {
                p.x = tileX + TILE_SIZE + 1;
            }
        }
    } else {
        if (dy === 0 && p.moving) {
            const centerY = p.y + p.height / 2;
            const tileY = Math.floor(centerY / TILE_SIZE) * TILE_SIZE;
            const diff = p.y - tileY;
            if (Math.abs(diff) < 4) {
                p.y = tileY + 1;
            } else if (Math.abs(diff - TILE_SIZE) < 4) {
                p.y = tileY + TILE_SIZE + 1;
            }
        }
    }

    if (dx !== 0 || dy !== 0) {
      const newX = p.x + dx;
      const newY = p.y + dy;
      if (!this.checkWallCollision({ ...p, x: newX, y: newY })) {
        p.x = newX;
        p.y = newY;
      } else {
          // Try sliding
          if (dx !== 0) {
             if (!this.checkWallCollision({ ...p, x: newX, y: p.y })) p.x = newX;
          }
          if (dy !== 0) {
             if (!this.checkWallCollision({ ...p, x: p.x, y: newY })) p.y = newY;
          }
      }
    }

    if (this.keys[' '] && p.cooldown <= 0) {
      this.fireBullet(p);
    }
  }

  updateEnemies(deltaTime: number) {
    this.enemySpawnTimer -= deltaTime;
    if (this.enemySpawnTimer <= 0 && this.state.enemies.length < 4) {
      this.spawnEnemy();
      this.enemySpawnTimer = 3000; // Spawn every 3 seconds
    }

    for (const enemy of this.state.enemies) {
      if (enemy.cooldown > 0) enemy.cooldown--;

      let dx = 0;
      let dy = 0;
      
      // Randomly change direction or if stuck
      if (Math.random() < 0.02) {
          enemy.direction = Math.floor(Math.random() * 4);
      }

      if (enemy.direction === Direction.UP) dy = -enemy.speed;
      else if (enemy.direction === Direction.DOWN) dy = enemy.speed;
      else if (enemy.direction === Direction.LEFT) dx = -enemy.speed;
      else if (enemy.direction === Direction.RIGHT) dx = enemy.speed;

      const newX = enemy.x + dx;
      const newY = enemy.y + dy;

      if (!this.checkWallCollision({ ...enemy, x: newX, y: newY })) {
        enemy.x = newX;
        enemy.y = newY;
      } else {
        // Change direction if hit wall
        enemy.direction = Math.floor(Math.random() * 4);
      }

      // Randomly fire
      if (Math.random() < 0.02 && enemy.cooldown <= 0) {
        this.fireBullet(enemy);
      }
    }
  }

  spawnEnemy() {
    const spawnPoints = [
      { x: 0, y: 0 },
      { x: 12 * TILE_SIZE, y: 0 },
      { x: 24 * TILE_SIZE, y: 0 },
    ];
    const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    
    this.state.enemies.push({
      x: pt.x + 1,
      y: pt.y + 1,
      width: TANK_SIZE,
      height: TANK_SIZE,
      direction: Direction.DOWN,
      speed: ENEMY_SPEED,
      isPlayer: false,
      cooldown: 0,
      hp: 1,
      moving: true,
    });
  }

  fireBullet(tank: Tank) {
    tank.cooldown = tank.isPlayer ? 30 : 60;
    
    let bx = tank.x + tank.width / 2 - BULLET_SIZE / 2;
    let by = tank.y + tank.height / 2 - BULLET_SIZE / 2;

    if (tank.direction === Direction.UP) by = tank.y - BULLET_SIZE;
    else if (tank.direction === Direction.DOWN) by = tank.y + tank.height;
    else if (tank.direction === Direction.LEFT) bx = tank.x - BULLET_SIZE;
    else if (tank.direction === Direction.RIGHT) bx = tank.x + tank.width;

    this.state.bullets.push({
      x: bx,
      y: by,
      width: BULLET_SIZE,
      height: BULLET_SIZE,
      direction: tank.direction,
      speed: BULLET_SPEED,
      isPlayer: tank.isPlayer,
      active: true,
    });
  }

  updateBullets() {
    for (const b of this.state.bullets) {
      if (!b.active) continue;

      if (b.direction === Direction.UP) b.y -= b.speed;
      else if (b.direction === Direction.DOWN) b.y += b.speed;
      else if (b.direction === Direction.LEFT) b.x -= b.speed;
      else if (b.direction === Direction.RIGHT) b.x += b.speed;

      // Bounds check
      if (b.x < 0 || b.x > CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
        b.active = false;
        continue;
      }

      // Wall collision
      const hitWall = this.checkBulletWallCollision(b);
      if (hitWall) {
        b.active = false;
      }
    }

    this.state.bullets = this.state.bullets.filter(b => b.active);
  }

  checkCollisions() {
    // Bullet vs Tanks
    for (const b of this.state.bullets) {
      if (!b.active) continue;

      if (b.isPlayer) {
        for (let i = 0; i < this.state.enemies.length; i++) {
          const e = this.state.enemies[i];
          if (this.rectIntersect(b, e)) {
            b.active = false;
            this.state.enemies.splice(i, 1);
            this.state.score += 100;
            break;
          }
        }
      } else {
        if (this.state.player && this.rectIntersect(b, this.state.player)) {
          b.active = false;
          this.state.player = null;
          this.state.gameOver = true;
        }
      }
    }
  }

  checkWallCollision(entity: { x: number, y: number, width: number, height: number }): boolean {
    if (entity.x < 0 || entity.x + entity.width > CANVAS_WIDTH ||
        entity.y < 0 || entity.y + entity.height > CANVAS_HEIGHT) {
      return true;
    }

    const startX = Math.floor(entity.x / TILE_SIZE);
    const endX = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
    const startY = Math.floor(entity.y / TILE_SIZE);
    const endY = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
          const tile = this.state.map[y][x];
          if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.WATER || tile === TileType.BASE) {
            return true;
          }
        }
      }
    }
    return false;
  }

  checkBulletWallCollision(b: Bullet): boolean {
    const startX = Math.floor(b.x / TILE_SIZE);
    const endX = Math.floor((b.x + b.width - 1) / TILE_SIZE);
    const startY = Math.floor(b.y / TILE_SIZE);
    const endY = Math.floor((b.y + b.height - 1) / TILE_SIZE);

    let hit = false;
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
          const tile = this.state.map[y][x];
          if (tile === TileType.BRICK) {
            this.state.map[y][x] = TileType.EMPTY;
            hit = true;
          } else if (tile === TileType.STEEL) {
            hit = true;
          } else if (tile === TileType.BASE) {
            this.state.map[y][x] = TileType.EMPTY;
            this.state.baseDestroyed = true;
            this.state.gameOver = true;
            hit = true;
          }
        }
      }
    }
    return hit;
  }

  rectIntersect(r1: {x: number, y: number, width: number, height: number}, r2: {x: number, y: number, width: number, height: number}) {
    return !(r2.x > r1.x + r1.width || 
             r2.x + r2.width < r1.x || 
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
  }
}
